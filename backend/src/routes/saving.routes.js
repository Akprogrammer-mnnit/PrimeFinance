import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { deleteSaving, getAllSaving, getSavingById, setSavingDetails, updateSavingDetails } from '../controllers/saving.controller.js';

const router = Router()

router.use(verifyJWT)

router.route('/').get(getAllSaving)
router.route('/create-saving').post(setSavingDetails)
router.route('/delete-saving/:savingId').delete(deleteSaving)
router.route('/update-saving/:savingId').post(updateSavingDetails)
router.route('/getSavingById/:savingId').get(getSavingById)

export default router;