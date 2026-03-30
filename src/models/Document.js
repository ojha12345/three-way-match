import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, default: null },
    sku: { type: String, default: null },
    description: { type: String, default: null },
    quantity: { type: Number, default: null },
    receivedQuantity: { type: Number, default: null }
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: ["po", "grn", "invoice"],
      required: true,
      index: true
    },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    poNumber: { type: String, required: true, index: true },
    rawText: { type: String, default: "" },
    parsedData: { type: mongoose.Schema.Types.Mixed, required: true },
    items: { type: [itemSchema], default: [] },
    parseStatus: {
      type: String,
      enum: ["success", "failed"],
      default: "success"
    },
    parseError: { type: String, default: null }
  },
  { timestamps: true }
);

documentSchema.index({ poNumber: 1, documentType: 1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;