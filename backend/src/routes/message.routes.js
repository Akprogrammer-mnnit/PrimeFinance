import {Router} from "express" 
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMessages, getUserForSideBar, sendMessage } from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use(verifyJWT)

router.route('/').get(getUserForSideBar)
router.route('/get-message/:receiverId').get(getMessages)
router.route('/send-message/:receiverId').post(upload.single("image"),sendMessage)
export default router
