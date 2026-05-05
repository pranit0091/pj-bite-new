import mongoose, { Schema, Document } from "mongoose";

export interface IJobOpening extends Document {
  title: string;
  type: string;
  location: string;
  description: string;
  tags: string[];
  active: boolean;
  order: number;
}

const JobOpeningSchema = new Schema<IJobOpening>(
  {
    title:       { type: String, required: true },
    type:        { type: String, required: true, default: "Full-time" },
    location:    { type: String, required: true },
    description: { type: String, required: true },
    tags:        [{ type: String }],
    active:      { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.JobOpening || mongoose.model<IJobOpening>("JobOpening", JobOpeningSchema);
