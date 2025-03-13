import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { changeDebtDetails, createDebt, deleteDebt, getDebtById, getUserAllDebt } from "../controllers/debt.controller.js";

const router = Router();

router.use(verifyJWT)
router.route('/').get(getUserAllDebt)
router.route('/create-debt').post(createDebt)
router.route('/delete-debt/:debtId').delete(deleteDebt)
router.route('/update-debt/:debtId').post(changeDebtDetails)
router.route('/getDebtById/:debtId').get(getDebtById)
export default router;