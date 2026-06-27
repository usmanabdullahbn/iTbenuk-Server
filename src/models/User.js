import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const EnrollmentSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    paymentReference: String,
    progress: { type: Number, min: 0, max: 100, default: 0 },
    enrolledAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"]
    },
    password: { type: String, required: true, minlength: 8, select: false },
    googleUid: { type: String, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    enrolledCourses: [EnrollmentSchema]
  },
  { timestamps: true }
);

UserSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    googleUid: this.googleUid,
    authProvider: this.authProvider,
    enrolledCourses: this.enrolledCourses
  };
};

export default mongoose.model("User", UserSchema);
