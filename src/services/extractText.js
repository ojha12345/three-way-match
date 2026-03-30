import pdfParse from "pdf-parse";

export async function extractTextFromFile(buffer, mimeType) {
  if (!buffer) return "";

  if (mimeType === "application/pdf") {
    const result = await pdfParse(buffer);
    return result.text || "";
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf8");
  }

  // For images, you can later plug OCR here if needed.
  // For this assignment, PDFs are the main input.
  return buffer.toString("utf8");
}