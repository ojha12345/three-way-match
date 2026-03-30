import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getGeminiClient } from "../config/gemini.js";

const poSchema = z.object({
  poNumber: z.string().min(1),
  poDate: z.string().min(1),
  vendorName: z.string().optional().nullable(),
  items: z.array(
    z.object({
      itemCode: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      quantity: z.coerce.number().nonnegative()
    })
  ).default([])
});

const grnSchema = z.object({
  grnNumber: z.string().min(1),
  poNumber: z.string().min(1),
  grnDate: z.string().min(1),
  items: z.array(
    z.object({
      itemCode: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      receivedQuantity: z.coerce.number().nonnegative()
    })
  ).default([])
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  poNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  items: z.array(
    z.object({
      itemCode: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      quantity: z.coerce.number().nonnegative()
    })
  ).default([])
});

function getSchemaByType(documentType) {
  if (documentType === "po") return poSchema;
  if (documentType === "grn") return grnSchema;
  if (documentType === "invoice") return invoiceSchema;
  throw new Error("Invalid document type");
}

function getPrompt(documentType, text) {
  return `
You are an information extraction engine.

Extract structured JSON from the following ${documentType.toUpperCase()} document text.

Rules:
- Return ONLY JSON.
- Follow the JSON schema exactly.
- Use empty arrays if items are missing.
- Preserve poNumber exactly as shown.
- Use best effort for dates in YYYY-MM-DD if possible.
- For each item, include itemCode, sku, description and quantity/receivedQuantity as applicable.
- Do not add explanations.

DOCUMENT TEXT:
${text}
`;
}

export async function parseDocumentWithGemini({ documentType, text }) {
  const schema = getSchemaByType(documentType);
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: getPrompt(documentType, text),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(schema)
    }
  });

  const raw = response.text?.trim();
  if (!raw) {
    throw new Error("Gemini returned empty response");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  return schema.parse(parsed);
}