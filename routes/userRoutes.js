import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

// ROute Level Middleware - To Protect Route
router.use('/user/nickname', checkUserAuth)

// Public Routes
router.post('/signup', UserController.userSignup)
router.post('/login', UserController.userLogin)
router.post('/password/reset', UserController.userReset)
router.post('/password/reset/:token', UserController.userPasswordReset)

// Protected Routes
router.get('/user/nickname', UserController.userNickname)


export default router