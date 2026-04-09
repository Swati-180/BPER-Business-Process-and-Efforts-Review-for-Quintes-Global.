const router = require('express').Router();
<<<<<<< HEAD
const { register, requestAccess, login, getMe, getAllUsers, updateUser, resetUserPassword, bulkUpdateUsers } = require('../controllers/authController');
=======
const { register, login, getMe, getAllUsers, requestAccess } = require('../controllers/authController');
>>>>>>> target/main
const verifyToken = require('../middleware/verifyToken');
const { allowRoles } = require('../middleware/roleCheck');

router.post('/register', register);
<<<<<<< HEAD
router.post('/request-access', requestAccess);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, allowRoles('admin'), getAllUsers);
router.patch('/users/:id', verifyToken, allowRoles('admin'), updateUser);
router.post('/users/:id/reset-password', verifyToken, allowRoles('admin'), resetUserPassword);
router.patch('/users/bulk', verifyToken, allowRoles('admin'), bulkUpdateUsers);
=======
router.post('/login', login);
router.post('/request-access', requestAccess);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, allowRoles('admin'), getAllUsers);
>>>>>>> target/main

module.exports = router;
