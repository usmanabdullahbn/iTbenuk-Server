import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    provider: { type: String, default: "paystack" },
    reference: { type: String, required: true, unique: true },
    checkoutUrl: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    rawEvent: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
