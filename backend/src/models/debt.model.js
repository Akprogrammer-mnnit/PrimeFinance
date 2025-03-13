import mongoose from "mongoose";
const debtSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  debtAmount: {
    type: Number,
    required: true,
    min: [0, 'Debt amount must be a positive number'],
  },
  interestRate: {
    type: Number,
    required: true,
    min: [0, 'Interest rate must be a positive number'],
  },
  debtTakenDate: {
    type: Date,
    required: true,
  },
  debtPayingDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending',
  },
  amountPaid: {
    type: Number,
    required: true,
    min: [0, 'Amount paid must be a positive number'],
    default: 0,
  },
  debtTakenFromName: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export const Debt = mongoose.model('Debt' , debtSchema);
