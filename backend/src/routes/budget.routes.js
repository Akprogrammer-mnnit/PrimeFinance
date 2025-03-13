import {Router} from 'express' 
import { changeBudgetDetails, createBudget, deleteBudget, getUserAllBudgets } from '../controllers/budget.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'
const router = Router();
router.use(verifyJWT);
router.route('/').get(getUserAllBudgets)
router.route('/create-budget').post(createBudget)
router.route('/delete-budget/:budgetId').delete(deleteBudget)
router.route('/update-budget/:budgetId').post(changeBudgetDetails)
export default router;