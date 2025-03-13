import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Debt } from "../models/debt.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createDebt = asyncHandler(async (req, res) => {
    const { debtAmount, interestRate, debtTakenDate, debtPayingDate, debtTakenFromName, amountPaid } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(404, "User not found");
    }
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid user ID");
    }
    if (!debtAmount || !interestRate || !debtTakenDate || !debtPayingDate || !debtTakenFromName) {
        throw new ApiError(404, "All fields are required");
    }
    if (new Date(debtPayingDate) < new Date(debtTakenDate)) {
        throw new ApiError(400, "Debt paying date cannot be earlier than the debt taken date");
    }
    const calculatedAmount = debtAmount + (debtAmount * (interestRate / 100));
    let status = "Pending";
    const today = new Date();
    if (new Date(debtPayingDate) < today) {
        status = "Overdue";
    }
    if (amountPaid >= calculatedAmount) {
        status = "Paid";
    }
    const debt = await Debt.create({
        owner: userId,
        debtAmount,
        interestRate,
        debtTakenDate,
        debtPayingDate,
        amountPaid,
        debtTakenFromName,
        status,
    });

    if (!debt) {
        throw new ApiError(500, "Failed to create debt");
    }

    res.status(200).json(new ApiResponse(200, debt, "Debt created successfully"));
});


const deleteDebt = asyncHandler(async (req, res) => {
    const { debtId } = req.params;

    if (!mongoose.isValidObjectId(debtId)) {
        throw new ApiError(401, "Invalid debt ID");
    }

    const deletedDebt = await Debt.findByIdAndDelete(debtId);

    if (!deletedDebt) {
        throw new ApiError(404, "Debt not found");
    }

    res.status(200).json(new ApiResponse(200, {}, "Debt deleted successfully"));
});

const changeDebtDetails = asyncHandler(async (req, res) => {
    const { debtId } = req.params;
    const { debtAmount, interestRate, debtTakenDate, debtPayingDate, amountPaid, debtTakenFromName } = req.body;

    if (!debtId) {
        throw new ApiError(404, "Debt ID not provided");
    }
    if (!mongoose.isValidObjectId(debtId)) {
        throw new ApiError(401, "Invalid debt ID");
    }
    if (!(debtAmount || interestRate || debtTakenDate || debtTakenFromName || debtPayingDate)) {
        throw new ApiError(404, "At least one field is required to update");
    }

    const changes = {};
    if (debtAmount) changes.debtAmount = debtAmount;
    if (interestRate) changes.interestRate = interestRate;
    if (debtTakenDate) changes.debtTakenDate = debtTakenDate;
    if (debtPayingDate) changes.debtPayingDate = debtPayingDate;
    if (amountPaid) changes.amountPaid = amountPaid;
    if (debtTakenFromName) changes.debtTakenFromName = debtTakenFromName;
    const existingDebt = await Debt.findById(debtId);
    if (!existingDebt) {
        throw new ApiError(404, "Debt not found");
    }
    const updatedDebtAmount = changes.debtAmount || existingDebt.debtAmount;
    const updatedInterestRate = changes.interestRate || existingDebt.interestRate;
    const updatedDebtPayingDate = changes.debtPayingDate || existingDebt.debtPayingDate;
    const updatedAmountPaid = changes.amountPaid || existingDebt.amountPaid;debtTakenFromName;
    const calculatedAmount = updatedDebtAmount + (updatedDebtAmount * (updatedInterestRate / 100));
    let status = existingDebt.status;
    const today = new Date();
    if (new Date(updatedDebtPayingDate) < today) {
        status = "Overdue";
    }
    else {
        status = 'Pending'
    }
    if (updatedAmountPaid >= calculatedAmount) {
        status = "Paid";
    }
    else {
        status = 'Pending'
    }

    changes.status = status; 

    const updatedDebt = await Debt.findByIdAndUpdate(debtId, changes, { new: true });
    if (!updatedDebt) {
        throw new ApiError(500, "Debt not updated");
    }

    res.status(200).json(new ApiResponse(200, updatedDebt, "Debt details updated successfully"));
});



const getUserAllDebt = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    if (!userId) {
        throw new ApiError(404, "User not found");
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid user ID");
    }

    const pipeline = [];
    pipeline.push({
        $match: {
            owner: new mongoose.Types.ObjectId(userId),
        },
    });
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "debtTakenFrom",
            foreignField: "_id",
            as: "userDetails",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        avatar: 1,
                    },
                },
            ],
        },
    });
    if (query) {
        pipeline.push({
            $match: {
                debtTakenFromName: { $regex: query, $options: "i" }
            },
        });
    }

    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1,
            },
        });
    } else {
        pipeline.push({
            $sort: {
                createdAt: -1,
            },
        });
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    pipeline.push(
        { $skip: skip },
        { $limit: parseInt(limit, 10) },
    );

    const debts = await Debt.aggregate(pipeline);

    const totalDebts = await Debt.countDocuments(
        query
            ? {
                debtTakenFrom: { $regex: query, $options: "i" },
                owner: new mongoose.Types.ObjectId(userId),
              }
            : { owner: new mongoose.Types.ObjectId(userId) },
    );
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                debts,
                totalDebts,
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalDebts / parseInt(limit, 10)),
            },
            "Debts fetched successfully"
        )
    );
});

const getDebtById = asyncHandler(async(req,res)=>{
    const { debtId } = req.params;
    if (!mongoose.isValidObjectId(debtId)) {
        throw new ApiError(401, "Invalid debt ID");
    }
    const debt = await Debt.findById(debtId);
    if (!debt) {
        throw new ApiError(404, "Debt not found");
    }
    res.status(200).json(new ApiResponse(200, debt, "Debt fetched successfully"));
})

export  {
    createDebt,
    deleteDebt,
    changeDebtDetails,
    getUserAllDebt,
    getDebtById
};
