import mongoose from "mongoose";

const recurringPaymentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    frequency: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date, 
    },
    nextPaymentDate: {
        type: Date, 
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true, 
});

recurringPaymentSchema.pre('save', function (next) {
    if (!this.nextPaymentDate && this.startDate) {
        this.nextPaymentDate = calculateNextPaymentDate(this.startDate, this.frequency);
    }
    next();
});

function calculateNextPaymentDate(startDate, frequency) {
    const nextDate = new Date(startDate);
    switch (frequency) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }
    return nextDate;
}

export const RecurringPayment = mongoose.model('RecurringPayment',recurringPaymentSchema)
