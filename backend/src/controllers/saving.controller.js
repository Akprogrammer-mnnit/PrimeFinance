import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import { Saving } from "../models/saving.model.js";
import {ApiResponse} from '../utils/ApiResponse.js'
const setSavingDetails = asyncHandler(async(req,res) => {
    const {goalAmount , currentAmount,deadline} = req.body;
    if (!goalAmount || currentAmount === undefined || currentAmount === null ||!deadline) {
        throw new ApiError(404,"All fields are required")
    }
    const currentDate = new Date();
    let status;

    if (currentDate > new Date(deadline)) {
        status = "missed";
    } else if (currentAmount >= goalAmount) {
        status = "completed"; 
    } else {
        status = "active"
    }
    const saving  = await Saving.create({
        goalAmount,
        currentAmount,
        deadline,
        owner: req.user?._id,
        status,
    })

    if (!saving) {
        throw new ApiError(500,"Error creating saving")
    }

    return res.status(200).json(
        new ApiResponse(200, saving,"Saving created successfully")
    )

})

const updateSavingDetails = asyncHandler(async(req,res) => {
    const {goalAmount , currentAmount,deadline} = req.body;
    const {savingId}  = req.params;
    if(!savingId){
        throw new ApiError(404,"Saving ID is required")
    }
    
    if (!(goalAmount || currentAmount !== undefined || currentAmount !== null || deadline)){
        throw new ApiError(404,"Entries are required to update")
    }
    const  updateFields = {};
    if (goalAmount) updateFields.goalAmount = goalAmount;
    if (currentAmount) updateFields.currentAmount = currentAmount;
    if (deadline) updateFields.deadline = deadline;
    const saving = await Saving.findByIdAndUpdate(savingId, updateFields,{new: true});

    if (!saving) {
        throw new ApiError(500,"Error while updating ")
    }
    const currentDate = new Date();
    let status;

    if (currentDate > new Date(saving.deadline)) {
        status = "missed";
    } else if (saving.currentAmount >= saving.goalAmount) {
        status = "completed"; 
    } else {
        status = "active"
    }
    const updatedSaving  = await Saving.findByIdAndUpdate(
        savingId,
        {
            status: status,
        },
        {
            new: true,
        }
    )
    if (!updatedSaving) {
        throw new ApiError(500,"Error while updating status")
    }
    return res.status(200).json(
        new ApiResponse(200, updatedSaving,"Saving updated successfully")
    )
})

const deleteSaving = asyncHandler(async(req,res) => {
    const {savingId}  = req.params;
    if(!savingId){
        throw new ApiError(404,"Saving ID is required")
    }
    const saving = await Saving.findByIdAndDelete(savingId);
    if (!saving) {
        throw new ApiError(500,"Error while deleting ")
    }
    return res.status(200).json(
        new ApiResponse(200,{},"Saving deleted successfully")
    )
})

const getAllSaving = asyncHandler(async(req,res) => {
    const savings = await Saving.find({owner: req.user?._id});
    if (!savings) {
        throw new ApiError(500,"Error while fetching savings")
    }
    return res.status(200).json(
        new ApiResponse(200,savings,"Savings fetched successfully")
    )
})


const getSavingById = asyncHandler(async(req,res) => {
    const {savingId}  = req.params;
    if(!savingId){
        throw new ApiError(404,"Saving ID is required")
    }
    const saving = await Saving.findById(savingId);
    if (!saving) {
        throw new ApiError(404,"Saving not found")
    }
    return res.status(200).json(
        new ApiResponse(200,saving,"Saving fetched successfully")
    )
})
export {
    setSavingDetails,
    updateSavingDetails,
    deleteSaving,
    getAllSaving,
    getSavingById
}
