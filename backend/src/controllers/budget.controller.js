import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Budget from "../models/budget.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUserAllBudgets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    if (!userId) {
        throw new ApiError(404, "User not found");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid user");
    }

    let pipeline = [];

    if (query) {
        const searchPipeline = [
            {
                $search: {
                    index: "budget",
                    text: {
                        query: query,
                        path: ["type", "category"]
                    }
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ];

        const searchResults = await Budget.aggregate(searchPipeline);

        if (Object.keys(searchResults).length === 0) {
            return res.status(200).json(
                new ApiResponse(200, {budgets: {}}, "No budgets found")
            );
        }

        const budgetIds = searchResults.map(budget => budget._id);

        pipeline.push({
            $match: {
                _id: { $in: budgetIds },
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    } else {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({
            $sort: {
                createdAt: -1
            }
        });
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    pipeline.push(
        { $skip: skip },
        { $limit: parseInt(limit, 10) }
    );


    const budgets = await Budget.aggregate(pipeline);

    const totalBudgets = await Budget.countDocuments(
        query
            ? { _id: { $in: budgets.map(budget => budget._id) }, owner: userId }
            : { owner: userId }
    );
    return res.status(200).json(
        new ApiResponse(200, {
            budgets,
            totalBudgets,
            currentPage: parseInt(page, 10),
            totalPages: Math.ceil(totalBudgets / parseInt(limit, 10))
        }, "Budgets fetched successfully")
    );
});


const createBudget = asyncHandler(async (req,res)=> {
    const {type,amount,category} = req.body
    if (!type || !amount || !category || amount === 0) {
        throw new ApiError(404,"All fields are required")
    } 
    const budget = await Budget.create({
        type,
        amount,
        category: category.toLowerCase(),
        owner: req.user?._id,
    })
    if (!budget){
        throw new ApiError(501,"Error while creating budget")
    }
    return res.status(200).json(
        new ApiResponse(200,budget,"Budget created successfully")
    )
})
const changeBudgetDetails = asyncHandler(async(req,res)=> {
    const {budgetId} = req.params
    const {type,amount,category} = req.body
    if (!(type || amount || category)){
        throw new ApiError(404,"All fields are required")
    }
    if (!isValidObjectId(budgetId)){
        throw new ApiError(401,"Invalid budget ID")
    }
    const changes = {}
    if (type) changes.type = type
    if (amount) changes.amount = amount
    if (category) changes.category = category
    const budget = await Budget.findByIdAndUpdate(budgetId, changes, {new:true})
    if (!budget){
        throw new ApiError(501,"Error while updating budget")
    }
    return res.status(200).json(
        new ApiResponse(200,budget,"Budget details updated successfully")
    )
})
const deleteBudget = asyncHandler(async(req,res)=> {
    const {budgetId} = req.params
    if (!budgetId){
        throw new ApiError(404,"Budget ID is required")
    }
    if (!isValidObjectId(budgetId)){
        throw new ApiError(401,"Invalid budget ID")
    }
    const budget = await Budget.findByIdAndDelete(budgetId)
    if (!budget){
        throw new ApiError(501,"Error while deleting budget")
    }
    return res.status(200).json(
        new ApiResponse(200,{},"Budget deleted successfully")
    )
})

export {
    createBudget,
    changeBudgetDetails,
    deleteBudget,
    getUserAllBudgets,
}