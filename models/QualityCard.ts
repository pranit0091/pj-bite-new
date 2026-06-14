import mongoose, { Schema, Document } from "mongoose";

export interface IQualityCard extends Document {
  title: string;
  desc: string;
  img: string;
  alt: string;
  order: number;
  active: boolean;
  // Public URL to a test/quality-verification report (PDF or image). Used by
  // the "Crafted with care" section so visitors can click a card to view the
  // proof document for that claim.
  reportUrl: string;
}

const QualityCardSchema = new Schema<IQualityCard>(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    reportUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const QualityCard =
  mongoose.models.QualityCard ||
  mongoose.model<IQualityCard>("QualityCard", QualityCardSchema);
export default QualityCard;
