import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {getAllRecurringPayments,createRecurringPayment,deleteRecurringPayment,updateRecurringPayment, getRecurringPaymentById} from '../controllers/recurringPayment.controller.js'
const router = Router()

router.use(verifyJWT)

router.route('/').get(getAllRecurringPayments);
router.route('/create-recurringPayment').post(createRecurringPayment)
router.route('/delete-recurringPayment/:recurringPaymentId').delete(deleteRecurringPayment)
router.route('/update-recurringPayment/:recurringPaymentId').post(updateRecurringPayment)
router.route('/get-recurringPaymentById/:recurringPaymentId').get(getRecurringPaymentById)
export default router