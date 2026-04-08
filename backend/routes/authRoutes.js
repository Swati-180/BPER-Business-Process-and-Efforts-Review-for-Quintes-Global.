const router = require('express').Router();
const { register, login, getMe, getAllUsers, requestAccess } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const { allowRoles } = require('../middleware/roleCheck');

router.post('/register', register);
router.post('/login', login);
router.post('/request-access', requestAccess);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, allowRoles('admin'), getAllUsers);

module.exports = router;
