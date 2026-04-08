const router = require('express').Router();
const { getStandardHours, updateStandardHours, getAllSettings, getSubmissionWindow } = require('../controllers/settingsController');
const verifyToken = require('../middleware/verifyToken');
const { allowRoles } = require('../middleware/roleCheck');

router.get('/standardHours', verifyToken, getStandardHours);
router.put('/standardHours', verifyToken, allowRoles('admin'), updateStandardHours);
router.get('/all', verifyToken, allowRoles('admin'), getAllSettings);
router.get('/submission-window', verifyToken, getSubmissionWindow);

module.exports = router;
