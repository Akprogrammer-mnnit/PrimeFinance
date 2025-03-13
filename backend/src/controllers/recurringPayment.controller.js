import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {ApiError} from '../utils/ApiError.js'
import {RecurringPayment} from '../models/recurringPayment.model.js'
const createRecurringPayment = asyncHandler(async (req, res) => {
    const { title, amount, frequency, startDate, endDate} = req.body;

    if (!title || !amount || !frequency || !startDate ) {
        throw new ApiError(400, "All required fields must be filled");
    }
    const recurringPayment = await RecurringPayment.create({
        title,
        amount,
        frequency,
        startDate,
        endDate,
        owner: req.user._id,
    });

    if (!recurringPayment) {
        throw new ApiError(500, "Error creating recurring payment");
    }

    return res.status(201).json(new ApiResponse(201, recurringPayment, "Recurring payment created successfully"));
});


const getAllRecurringPayments = asyncHandler(async (req, res) => {
    const recurringPayments = await RecurringPayment.find({ owner: req.user._id });

    if (!recurringPayments) {
        throw new ApiError(404, "No recurring payments found");
    }

    return res.status(200).json(new ApiResponse(200, recurringPayments, "Recurring payments retrieved successfully"));
});


const updateRecurringPayment = asyncHandler(async (req, res) => {
    const { recurringPaymentId } = req.params;
    const { title, amount, frequency, startDate, endDate} = req.body;

    if (!recurringPaymentId) {
        throw new ApiError(400, "Recurring payment ID is required");
    }
    if (!(title || amount || frequency || startDate || endDate)) {
        throw new ApiError(404, "At least one field must be updated");
    }
    const updateFields = {};
    if (title) updateFields.title = title;
    if (amount) updateFields.amount = amount;
    if (frequency) {
        updateFields.frequency = frequency;
    }
    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;
    const updatedPayment = await RecurringPayment.findByIdAndUpdate(recurringPaymentId, updateFields, {
        new: true,
    });

    if (!updatedPayment) {
        throw new ApiError(500, "Error updating recurring payment");
    }

    return res.status(200).json(new ApiResponse(200, updatedPayment, "Recurring payment updated successfully"));
});

const deleteRecurringPayment = asyncHandler(async (req, res) => {
    const { recurringPaymentId } = req.params;

    if (!recurringPaymentId) {
        throw new ApiError(400, "Recurring payment ID is required");
    }

    const deletedPayment = await RecurringPayment.findByIdAndDelete(recurringPaymentId);

    if (!deletedPayment) {
        throw new ApiError(500, "Error deleting recurring payment");
    }

    return res.status(200).json(new ApiResponse(200, {} , "Recurring payment deleted successfully"));
});

const getRecurringPaymentById = asyncHandler(async (req, res) => {
    const { recurringPaymentId } = req.params;
    if (!recurringPaymentId) {
        throw new ApiError(400, "Recurring payment ID is required");
    }
    const recurringPayment = await RecurringPayment.findById(recurringPaymentId);
    if (!recurringPayment) {
        throw new ApiError(404, "Recurring payment not found");
    }
    return res.status(200).json(new ApiResponse(200, recurringPayment, "Recurring payment fetched successfully"));
})

export {
    createRecurringPayment,
    getAllRecurringPayments,
    updateRecurringPayment,
    deleteRecurringPayment,
    getRecurringPaymentById,
}
