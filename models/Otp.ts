import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  email?: string;
  phone?: string;
  otp: string;
  sentAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  email:   { type: String, sparse: true },
  phone:   { type: String, sparse: true, index: true },
  otp:     { type: String, required: true },
  sentAt:  { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, expires: "10m" }, // MongoDB TTL — auto-deletes after 10 min
});

export default mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
