import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changePassword, getAllUser, getCurrentUser, loginUser, logoutUser, RefreshAccessToken, registerUser, updateUserAvatar } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route('/').get(verifyJWT,getAllUser)
router.route('/register').post(upload.single("avatar"),registerUser);
router.route('/login').post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(RefreshAccessToken)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route('/getCurrentUser').get(verifyJWT, getCurrentUser)
export default router;