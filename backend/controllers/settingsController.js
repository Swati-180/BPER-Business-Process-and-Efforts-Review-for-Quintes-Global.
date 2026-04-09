const Setting = require('../models/Setting');

// GET /api/eper/settings/standardHours
const getStandardHours = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'standardHours' });
    res.json({ value: setting ? setting.value : 160 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/eper/settings/standardHours  (admin only)
const updateStandardHours = async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || isNaN(value) || value < 1) {
      return res.status(400).json({ message: 'Invalid value for standardHours.' });
    }
    const setting = await Setting.findOneAndUpdate(
      { key: 'standardHours' },
      { value: Number(value) },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/eper/settings/all  (admin)
const getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
<<<<<<< HEAD

module.exports = { getStandardHours, updateStandardHours, getAllSettings };
=======
// GET /api/eper/settings/submission-window
const getSubmissionWindow = async (req, res) => {
  try {
    const deadlineSetting = await Setting.findOne({ key: 'submissionDeadline' });
    // Default to the end of next month if no setting exists
    const defaultDeadline = new Date();
    defaultDeadline.setMonth(defaultDeadline.getMonth() + 1);
    defaultDeadline.setDate(15);
    
    const deadline = deadlineSetting ? new Date(deadlineSetting.value) : defaultDeadline;
    const now = new Date();
    
    const isOpen = now <= deadline;
    res.json({ isOpen, deadline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStandardHours, updateStandardHours, getAllSettings, getSubmissionWindow };
>>>>>>> target/main
