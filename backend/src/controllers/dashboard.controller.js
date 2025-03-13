import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import Budget from "../models/budget.model.js";
import { Debt } from "../models/debt.model.js";
import { RecurringPayment } from "../models/recurringPayment.model.js";
import { Saving } from "../models/saving.model.js";

const dashboard = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(404, "User not found");
    }
    if (!isValidObjectId(userId)) {
        throw new Error(401, "Invalid user ID");
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const BudgetDetails = await Budget.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: {
                    category: "$category",
                    type: "$type",
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                },
                totalAmount: { $sum: "$amount" },
            },
        },
        {
            $group: {
                _id: "$_id.type",
                details: {
                    $push: {
                        category: "$_id.category",
                        month: "$_id.month",
                        year: "$_id.year",
                        totalAmount: "$totalAmount",
                    },
                },
                total: { $sum: "$totalAmount" },
            },
        },
        {
            $project: {
                _id: 0,
                type: "$_id",
                details: 1,
                total: 1,
            },
        },
    ]);

    const DebtDetails = await Debt.aggregate([
        { 
            $match: { owner: new mongoose.Types.ObjectId(userId) } 
        },
        {
            $addFields: {
                actualPayingDebt: { 
                    $add: ["$debtAmount", { $multiply: ["$debtAmount", { $divide: ["$interestRate", 100] }] }] 
                },
                outstandingDebt: { 
                    $subtract: [
                        { $add: ["$debtAmount", { $multiply: ["$debtAmount", { $divide: ["$interestRate", 100] }] }] }, 
                        "$amountPaid"
                    ] 
                },
            },
        },
        {
            $facet: {
                totalMetrics: [
                    {
                        $group: {
                            _id: null,
                            totalDebt: { $sum: "$debtAmount" },
                            totalPaid: { $sum: "$amountPaid" },
                            totalOutstanding: { $sum: "$outstandingDebt" },
                        },
                    },
                ],
                statusBreakdown: [
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                            totalDebt: { $sum: "$debtAmount" },
                            totalOutstanding: { $sum: "$outstandingDebt" },
                        },
                    },
                ],
                debtByCreditor: [
                    {
                        $group: {
                            _id: "$debtTakenFromName",
                            totalDebt: { $sum: "$debtAmount" },
                            totalOutstanding: { $sum: "$outstandingDebt" },
                            totalPaid: { $sum: "$amountPaid" },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                totalMetrics: { $arrayElemAt: ["$totalMetrics", 0] },
                statusBreakdown: 1,
                debtByCreditor: 1,
            },
        },
    ]);
    

    const RecurringPaymentDetails = await RecurringPayment.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $addFields: {
                isActive: {
                    $cond: [
                        { $or: [{ $eq: ["$endDate", null] }, { $gt: ["$endDate", today] }] },
                        true,
                        false,
                    ],
                },
            },
        },
        {
            $facet: {
                totalMetrics: [
                    {
                        $group: {
                            _id: null,
                            totalPayments: { $sum: "$amount" },
                            activePayments: { $sum: { $cond: ["$isActive", 1, 0] } },
                            expiredPayments: { $sum: { $cond: ["$isActive", 0, 1] } },
                        },
                    },
                ],
                paymentsByFrequency: [
                    {
                        $group: {
                            _id: "$frequency",
                            count: { $sum: 1 },
                            totalAmount: { $sum: "$amount" },
                        },
                    },
                ],
                upcomingPayments: [
                    {
                        $match: { nextPaymentDate: { $gte: today, $lte: nextWeek } },
                    },
                    {
                        $project: {
                            title: 1,
                            amount: 1,
                            nextPaymentDate: 1,
                            frequency: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                totalMetrics: { $arrayElemAt: ["$totalMetrics", 0] },
                paymentsByFrequency: 1,
                upcomingPayments: 1,
            },
        },
    ]);

    const SavingDetails = await Saving.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $facet: {
                totalMetrics: [
                    {
                        $group: {
                            _id: null,
                            totalGoals: { $sum: 1 },
                            totalGoalAmount: { $sum: "$goalAmount" },
                            totalCurrentAmount: { $sum: "$currentAmount" },
                        },
                    },
                ],
                statusMetrics: [
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ],
                upcomingDeadlines: [
                    {
                        $match: { deadline: { $gte: today, $lte: nextWeek } },
                    },
                    {
                        $project: {
                            goalAmount: 1,
                            currentAmount: 1,
                            deadline: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                totalMetrics: { $arrayElemAt: ["$totalMetrics", 0] },
                statusMetrics: 1,
                upcomingDeadlines: 1,
            },
        },
    ]);

    const result = {
        totalIncome: BudgetDetails.find((item) => item.type === "income")?.total || 0,
        totalExpenses: BudgetDetails.find((item) => item.type === "expense")?.total || 0,
        monthlySavingsGoal: SavingDetails[0]?.totalMetrics?.totalGoalAmount || 0,
        monthlyExpenses: BudgetDetails.find((item) => item.type === "expense")?.details.filter(
            (detail) => detail.month === today.getMonth() + 1
        ) || [],
        monthlyIncomes: BudgetDetails.find((item) => item.type === "income")?.details.filter(
            (detail) => detail.month === today.getMonth() + 1
        ) || [],
        incomeDetails: BudgetDetails.find((item) => item.type === "income")?.details || [],
        expenseDetails: BudgetDetails.find((item) => item.type === "expense")?.details || [],
        totalDebt: DebtDetails[0]?.totalMetrics?.totalDebt || 0,
        totalPaid: DebtDetails[0]?.totalMetrics?.totalPaid || 0,
        totalOutstanding: DebtDetails[0]?.totalMetrics?.totalOutstanding || 0,
        statusBreakdown: DebtDetails[0]?.statusBreakdown || [],
        debtByCreditor: DebtDetails[0]?.debtByCreditor || [],
        totalPayments: RecurringPaymentDetails[0]?.totalMetrics?.totalPayments || 0,
        activePayments: RecurringPaymentDetails[0]?.totalMetrics?.activePayments || 0,
        expiredPayments: RecurringPaymentDetails[0]?.totalMetrics?.expiredPayments || 0,
        paymentsByFrequency: RecurringPaymentDetails[0]?.paymentsByFrequency || [],
        upcomingPayments: RecurringPaymentDetails[0]?.upcomingPayments || [],
        totalGoals: SavingDetails[0]?.totalMetrics?.totalGoals || 0,
        totalGoalAmount: SavingDetails[0]?.totalMetrics?.totalGoalAmount || 0,
        totalCurrentAmount: SavingDetails[0]?.totalMetrics?.totalCurrentAmount || 0,
        statusMetrics: SavingDetails[0]?.statusMetrics || [],
        upcomingDeadlines: SavingDetails[0]?.upcomingDeadlines || [],
    };
    return res
        .status(200)
        .json(new ApiResponse(200, result, "Fetched dashboard data"));
});

export { dashboard };
