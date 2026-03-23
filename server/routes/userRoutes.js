import express from 'express';
import userController from '../controllers/userController.js';
import protectedRoute from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/login', userController.login);
router.post('/signup', userController.signUp);
router.get('/getUsers', protectedRoute, userController.getAllUsers);
router.get('/getAllFriendRequests', protectedRoute, userController.getAllFriendRequests);
router.get('/searchUsers', protectedRoute, userController.searchUsers);
router.post('/sendRequest', protectedRoute, userController.sendFriendRequest);
router.post('/updateRequests', protectedRoute, userController.acceptRequest);
router.get('/getAllFriends', protectedRoute, userController.getAllFriends);
router.post('/logout', protectedRoute, userController.logout);

router.put('/update-profile', protectedRoute, userController.updateProfile);

router.get('/check', protectedRoute, userController.checkAuth);
router.get('/:id', protectedRoute, userController.getUserProfile);
router.post('/toggle-follow/:id', protectedRoute, userController.toggleFollow);

export default router;
