import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEarlyAccessRequest extends Document {
  fullName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const EarlyAccessRequestSchema = new Schema<IEarlyAccessRequest>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "early_access_requests",
  },
);

// One request per email
EarlyAccessRequestSchema.index({ email: 1 }, { unique: true });

export const EarlyAccessRequest: Model<IEarlyAccessRequest> =
  mongoose.models.EarlyAccessRequest ||
  mongoose.model<IEarlyAccessRequest>(
    "EarlyAccessRequest",
    EarlyAccessRequestSchema,
  );
