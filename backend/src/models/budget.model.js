import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const budgetSchema = new mongoose.Schema(
  {
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Category must be at least 3 characters long"],
    },
  },
  { timestamps: true }
);
budgetSchema.plugin(aggregatePaginate);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
