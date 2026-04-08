const WdtSubmission = require('../models/WdtSubmission');
const Setting = require('../models/Setting');
const User = require('../models/User');

// POST /api/eper/wdt/submit
const submit = async (req, res) => {
  try {
    const { department, month, year, activities, overtimeHours } = req.body;

    // Get standardHours from settings
    const stdSetting = await Setting.findOne({ key: 'standardHours' });
    const standardHours = stdSetting ? stdSetting.value : 160;

    // Find reviewer (supervisor) — the person the employee reports to
    let reviewer = null;
    if (req.user.reportingTo) reviewer = req.user.reportingTo;

    // Check for existing draft/submission for this period
    let submission = await WdtSubmission.findOne({
      employee: req.user._id, month, year
    });

    if (submission && submission.status === 'approved') {
      return res.status(409).json({ message: 'An approved submission already exists for this period.' });
    }

    if (submission) {
      // Update existing draft
      submission.activities = activities;
      submission.department = department;
      submission.overtimeHours = overtimeHours || 0;
      submission.standardHours = standardHours;
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      submission.reviewer = reviewer;
      await submission.save(); // triggers pre-save hook
    } else {
      submission = await WdtSubmission.create({
        employee: req.user._id,
        department,
        reviewer,
        month,
        year,
        standardHours,
        overtimeHours: overtimeHours || 0,
        activities,
        status: 'submitted',
        submittedAt: new Date()
      });
    }

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/eper/wdt/draft
const saveDraft = async (req, res) => {
  try {
    const { department, month, year, activities, overtimeHours } = req.body;
    let reviewer = null;
    if (req.user.reportingTo) reviewer = req.user.reportingTo;

    let submission = await WdtSubmission.findOne({
      employee: req.user._id, month, year
    });

    if (submission && submission.status !== 'draft' && submission.status !== 'returned_for_revision') {
      return res.status(409).json({ message: 'A locked submission already exists for this period.' });
    }

    if (submission) {
      submission.activities = activities || [];
      if (department) submission.department = department;
      submission.overtimeHours = overtimeHours || 0;
      submission.status = 'draft';
      await submission.save();
    } else {
      submission = await WdtSubmission.create({
        employee: req.user._id,
        department,
        reviewer,
        month,
        year,
        overtimeHours: overtimeHours || 0,
        activities: activities || [],
        status: 'draft'
      });
    }

    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/eper/wdt/my
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await WdtSubmission.find({ employee: req.user._id })
      .populate('department', 'code name')
      .populate('reviewer', 'name email')
      .populate('activities.activity', 'name')
      .sort({ year: -1, month: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/eper/wdt/team   (supervisor only)
const getTeamSubmissions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'supervisor') {
      // Only see team members who report to this supervisor
      const teamMembers = await User.find({ reportingTo: req.user._id }).select('_id');
      const teamIds = teamMembers.map(m => m._id);
      query = { employee: { $in: teamIds } };
    } else if (req.user.role === 'tower_lead' && req.user.tower) {
      // Tower Lead sees all in their tower
      const towerMembers = await User.find({ tower: req.user.tower }).select('_id');
      const towerIds = towerMembers.map(m => m._id);
      query = { employee: { $in: towerIds } };
    }
    // admin see all (query = {})

    const submissions = await WdtSubmission.find(query)
      .populate('employee', 'name email grade department')
      .populate('department', 'code name')
      .populate('reviewer', 'name')
      .populate('activities.activity', 'name')
      .sort({ updatedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/eper/wdt/flag/:submissionId
const flagActivities = async (req, res) => {
  try {
    const { flags } = req.body; // [{ activityIndex: 0, flagComment: '...' }]
    const submission = await WdtSubmission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    // Set status to under_review when supervisor first flags
    if (submission.status === 'submitted') submission.status = 'under_review';

    flags.forEach(({ activityIndex, flagComment }) => {
      if (submission.activities[activityIndex]) {
        submission.activities[activityIndex].flaggedForRevision = true;
        submission.activities[activityIndex].flagComment = flagComment || '';
      }
    });

    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/eper/wdt/approve/:submissionId
const approveSubmission = async (req, res) => {
  try {
    const submission = await WdtSubmission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    if (!['submitted', 'under_review'].includes(submission.status)) {
      return res.status(400).json({ message: 'Submission cannot be approved in its current state.' });
    }

    submission.status = 'approved';
    submission.approvedAt = new Date();
    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/eper/wdt/return/:submissionId
const returnForRevision = async (req, res) => {
  try {
    const { revisionNote } = req.body;
    const submission = await WdtSubmission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    submission.status = 'returned_for_revision';
    submission.revisionNote = revisionNote || '';
    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/eper/wdt/edit/:submissionId
// Employee edits ONLY flagged rows
const editSubmission = async (req, res) => {
  try {
    const { activities } = req.body; // array of { activityIndex, updates }
    const submission = await WdtSubmission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    if (submission.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your submission.' });
    }

    if (submission.status !== 'returned_for_revision') {
      return res.status(400).json({ message: 'Submission is not in revision state.' });
    }

    activities.forEach(({ activityIndex, updates }) => {
      const act = submission.activities[activityIndex];
      if (!act) return;
      // Only allow edit if flagged OR permission granted
      if (!act.flaggedForRevision && !act.editPermissionGranted) return;
      Object.assign(act, updates);
    });

    submission.status = 'submitted';
    submission.submittedAt = new Date();
    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/eper/wdt/request-edit/:submissionId
const requestEdit = async (req, res) => {
  try {
    const { activityIndex, reason } = req.body;
    const submission = await WdtSubmission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    if (submission.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your submission.' });
    }

    if (submission.activities[activityIndex]) {
      submission.activities[activityIndex].editPermissionRequested = true;
      submission.activities[activityIndex].editPermissionReason = reason || '';
    }

    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/eper/wdt/grant-edit/:submissionId
const grantEdit = async (req, res) => {
  try {
    const { activityIndex, granted } = req.body;
    const submission = await WdtSubmission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    if (submission.activities[activityIndex]) {
      submission.activities[activityIndex].editPermissionGranted = granted;
      if (!granted) {
        submission.activities[activityIndex].editPermissionRequested = false;
      }
    }

    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  submit, saveDraft, getMySubmissions, getTeamSubmissions,
  flagActivities, approveSubmission, returnForRevision,
  editSubmission, requestEdit, grantEdit
};
