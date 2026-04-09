const router = require('express').Router();
const {
<<<<<<< HEAD
  saveDraft,
  submit, getMySubmissions, getTeamSubmissions,
  flagActivities, approveSubmission, returnForRevision,
  editSubmission, requestEdit, grantEdit, updateSubmissionStatus
=======
  submit, saveDraft, getMySubmissions, getTeamSubmissions,
  flagActivities, approveSubmission, returnForRevision,
  editSubmission, requestEdit, grantEdit
>>>>>>> target/main
} = require('../controllers/wdtController');
const verifyToken = require('../middleware/verifyToken');
const { allowRoles } = require('../middleware/roleCheck');

<<<<<<< HEAD
router.post('/draft', verifyToken, saveDraft);
router.post('/submit', verifyToken, submit);
router.get('/my', verifyToken, getMySubmissions);
router.get('/my-submissions', verifyToken, getMySubmissions);
router.get('/team', verifyToken, allowRoles('admin', 'supervisor', 'tower_lead'), getTeamSubmissions);
router.patch('/:id/status', verifyToken, allowRoles('admin', 'supervisor', 'tower_lead'), updateSubmissionStatus);
=======
router.post('/submit', verifyToken, submit);
router.post('/draft', verifyToken, saveDraft);
router.get('/my', verifyToken, getMySubmissions);
router.get('/team', verifyToken, allowRoles('admin', 'supervisor', 'tower_lead'), getTeamSubmissions);
>>>>>>> target/main
router.put('/flag/:submissionId', verifyToken, allowRoles('admin', 'supervisor', 'tower_lead'), flagActivities);
router.put('/approve/:submissionId', verifyToken, allowRoles('admin', 'supervisor', 'tower_lead'), approveSubmission);
router.put('/return/:submissionId', verifyToken, allowRoles('admin', 'supervisor', 'tower_lead'), returnForRevision);
router.put('/edit/:submissionId', verifyToken, editSubmission);
router.put('/request-edit/:submissionId', verifyToken, requestEdit);
router.put('/grant-edit/:submissionId', verifyToken, allowRoles('admin', 'supervisor', 'tower_lead'), grantEdit);

module.exports = router;
