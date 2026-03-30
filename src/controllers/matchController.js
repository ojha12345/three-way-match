import Document from "../models/Document.js";
import MatchSnapshot from "../models/MatchSnapshot.js";
import { computeMatchState } from "../services/matchEngine.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getMatchByPoNumber = async (req, res, next) => {
  try {
    const { poNumber } = req.params;

    const docs = await Document.find({ poNumber }).sort({ createdAt: 1 });

    if (!docs.length) {
      return successResponse(
        res,
        {
          poNumber,
          status: "insufficient_documents",
          reasons: ["po_missing"],
          documents: []
        },
        "No documents found for this PO number"
      );
    }

    const snapshot = await MatchSnapshot.findOne({ poNumber }).populate("linkedDocuments");

    if (snapshot) {
      return successResponse(res, snapshot, "Match snapshot fetched successfully");
    }

    const poDocs = docs.filter((d) => d.documentType === "po");
    const grnDocs = docs.filter((d) => d.documentType === "grn");
    const invoiceDocs = docs.filter((d) => d.documentType === "invoice");

    const computed = computeMatchState({ poDocs, grnDocs, invoiceDocs });

    return successResponse(
      res,
      {
        poNumber,
        ...computed,
        documents: docs
      },
      "Match computed successfully"
    );
  } catch (error) {
    next(error);
  }
};