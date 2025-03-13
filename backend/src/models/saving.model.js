import mongoose from "mongoose";

const savingSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    goalAmount: {
        type: Number,
        required: true,
    },
    currentAmount: {
        type: Number,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "missed", "completed"],
        default: "active",
    }
},{timestamps: true})

export const Saving = mongoose.model("Saving", savingSchema);