import mongoose from "mongoose";

const matchSnapshotSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["matched", "partially_matched", "mismatch", "insufficient_documents"],
      required: true
    },
    reasons: { type: [String], default: [] },
    summary: { type: mongoose.Schema.Types.Mixed, default: {} },
    linkedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document"
      }
    ]
  },
  { timestamps: true }
);

const MatchSnapshot = mongoose.model("MatchSnapshot", matchSnapshotSchema);

export default MatchSnapshot;