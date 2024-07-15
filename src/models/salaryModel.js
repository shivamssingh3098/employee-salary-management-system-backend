const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const salarySchema = new Schema(
  {
    empId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    month: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Salary = mongoose.model("Salary", salarySchema);
module.exports = Salary;
