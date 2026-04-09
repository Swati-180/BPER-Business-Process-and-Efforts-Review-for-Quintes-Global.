const router = require('express').Router();
<<<<<<< HEAD
const { getStandardHours, updateStandardHours, getAllSettings } = require('../controllers/settingsController');
=======
const { getStandardHours, updateStandardHours, getAllSettings, getSubmissionWindow } = require('../controllers/settingsController');
>>>>>>> target/main
const verifyToken = require('../middleware/verifyToken');
const { allowRoles } = require('../middleware/roleCheck');

router.get('/standardHours', verifyToken, getStandardHours);
router.put('/standardHours', verifyToken, allowRoles('admin'), updateStandardHours);
router.get('/all', verifyToken, allowRoles('admin'), getAllSettings);
<<<<<<< HEAD
=======
router.get('/submission-window', verifyToken, getSubmissionWindow);
>>>>>>> target/main

module.exports = router;
