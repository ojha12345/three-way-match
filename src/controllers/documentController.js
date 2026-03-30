import Document from "../models/Document.js";
import MatchSnapshot from "../models/MatchSnapshot.js";
import { extractTextFromFile } from "../services/extractText.js";
import { parseDocumentWithGemini } from "../services/geminiParser.js";
import { computeMatchState } from "../services/matchEngine.js";
import { successResponse, errorResponse } from "../utils/response.js";

async function recomputeMatch(poNumber) {
  const docs = await Document.find({ poNumber }).sort({ createdAt: 1 });

  const poDocs = docs.filter((d) => d.documentType === "po");
  const grnDocs = docs.filter((d) => d.documentType === "grn");
  const invoiceDocs = docs.filter((d) => d.documentType === "invoice");

  const computed = computeMatchState({ poDocs, grnDocs, invoiceDocs });

  await MatchSnapshot.findOneAndUpdate(
    { poNumber },
    {
      poNumber,
      status: computed.status,
      reasons: computed.reasons,
      summary: computed.summary,
      linkedDocuments: docs.map((d) => d._id)
    },
    { upsert: true, new: true }
  );

  return computed;
}

export const uploadDocument = async (req, res, next) => {
  try {
    const { documentType } = req.body;
    const file = req.file;

    if (!documentType || !["po", "grn", "invoice"].includes(documentType)) {
      return errorResponse(res, "documentType must be po, grn, or invoice", 400);
    }

    if (!file) {
      return errorResponse(res, "File is required", 400);
    }

    const extractedText = await extractTextFromFile(file.buffer, file.mimetype);
    if (!extractedText.trim()) {
      return errorResponse(res, "Could not extract text from the uploaded file", 400);
    }

    const parsedData = await parseDocumentWithGemini({
      documentType,
      text: extractedText
    });

    const poNumber = parsedData.poNumber;
    if (!poNumber) {
      return errorResponse(res, "Parsed document is missing poNumber", 400);
    }

    const doc = await Document.create({
      documentType,
      fileName: file.originalname,
      mimeType: file.mimetype,
      poNumber,
      rawText: extractedText,
      parsedData,
      items: parsedData.items || [],
      parseStatus: "success"
    });

    const match = await recomputeMatch(poNumber);

    return successResponse(
      res,
      {
        document: doc,
        match
      },
      "Document uploaded and parsed successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getParsedDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      return errorResponse(res, "Document not found", 404);
    }

    return successResponse(res, doc, "Parsed document fetched successfully");
  } catch (error) {
    next(error);
  }
};