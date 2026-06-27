import mongoose from "mongoose";
import validator from "validator";

const LeadSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"]
    },
    interestedCourse: { type: String, required: true, trim: true },
    source: { type: String, default: "landing-page" },
    userAgent: String,
    ipAddress: String,
    status: {
      type: String,
      enum: ["new", "contacted", "converted"],
      default: "new"
    }
  },
  { timestamps: true }
);

LeadSchema.index({ email: 1, interestedCourse: 1 }, { unique: true });

export default mongoose.model("Lead", LeadSchema);
