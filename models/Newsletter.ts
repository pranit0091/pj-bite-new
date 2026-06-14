import mongoose, { Schema, Document } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  source: string;
  subscribedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "footer" },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Newsletter =
  mongoose.models.Newsletter ||
  mongoose.model<INewsletter>("Newsletter", NewsletterSchema);
export default Newsletter;
