import mongoose, { Schema, Document } from "mongoose";

export interface IHomeSettings extends Document {
  trustStrip: Array<{ label: string; subline: string; iconType: string }>;
  benefits: Array<{ label: string; sub: string; iconName: string }>;
  purposes: Array<{ label: string; iconName: string; href: string }>;
  qualityClaims: string[];
  whyPjBite: Array<{ title: string; desc: string; iconName: string }>;
  howItWorks: Array<{ step: string; label: string; desc: string; iconName: string }>;
  bulkOrder: { badge: string; title: string; subtitle: string };
}

const HomeSettingsSchema = new Schema<IHomeSettings>(
  {
    trustStrip: {
      type: [
        {
          label: { type: String, default: "" },
          subline: { type: String, default: "" },
          iconType: { type: String, default: "" },
        },
      ],
      default: [],
    },
    benefits: {
      type: [
        {
          label: { type: String, default: "" },
          sub: { type: String, default: "" },
          iconName: { type: String, default: "Truck" },
        },
      ],
      default: [],
    },
    purposes: {
      type: [
        {
          label: { type: String, default: "" },
          iconName: { type: String, default: "Gift" },
          href: { type: String, default: "/products" },
        },
      ],
      default: [],
    },
    qualityClaims: { type: [String], default: [] },
    whyPjBite: {
      type: [
        {
          title: { type: String, default: "" },
          desc: { type: String, default: "" },
          iconName: { type: String, default: "Leaf" },
        },
      ],
      default: [],
    },
    howItWorks: {
      type: [
        {
          step: { type: String, default: "" },
          label: { type: String, default: "" },
          desc: { type: String, default: "" },
          iconName: { type: String, default: "Leaf" },
        },
      ],
      default: [],
    },
    bulkOrder: {
      badge: { type: String, default: "Corporate & Wholesale" },
      title: { type: String, default: "Big Savings on Bulk Orders!" },
      subtitle: { type: String, default: "Contact our team for special pricing on bulk dry fruit orders for events, gifting, and retail." },
    },
  },
  { timestamps: true }
);

const HomeSettings =
  mongoose.models.HomeSettings ||
  mongoose.model<IHomeSettings>("HomeSettings", HomeSettingsSchema);
export default HomeSettings;
