import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

// ROute Level Middleware - To Protect Route
router.use("/user/nickname", checkUserAuth)
router.use("/user/nickname", checkUserAuth)
router.use("/admin/make_admin/:email", checkUserAuth)
router.use("/admin/delete/:email", checkUserAuth)


router.post('/signup', UserController.userSignup)
router.post('/login', UserController.userLogin)
router.post('/password/reset', UserController.userReset)
router.post('/password/reset/:token', UserController.userPasswordReset)
router.get("/user/nickname", UserController.get_nickname)
router.post("/user/nickname", UserController.change_nickname)
router.get("/admin/make_admin/:email",UserController.change_role)
router.get("/admin/delete/:email", UserController.delete_user)

export default router