const { extractTextFromFile } = require('../utils/extractText');
const { extractStructuredDataWithGemini } = require('./geminiParser');

function mapLineItems(documentType, parsedData) {
  const items = Array.isArray(parsedData?.items) ? parsedData.items : [];

  return items.map((item) => ({
    itemCode: item.itemCode || '',
    sku: item.sku || '',
    description: item.description || '',
    quantity: documentType === 'grn' ? Number(item.receivedQuantity ?? item.quantity ?? 0) : Number(item.quantity ?? 0),
    receivedQuantity: Number(item.receivedQuantity ?? item.quantity ?? 0),
    uom: item.uom || '',
    hsnCode: item.hsnCode || '',
    brand: item.brand || '',
    mrp: Number(item.mrp ?? 0),
    baseCost: Number(item.baseCost ?? 0),
    taxableValue: Number(item.taxableValue ?? 0)
  }));
}

async function parseDocument({ file, documentType, geminiApiKey, geminiModel }) {
  const rawText = await extractTextFromFile(file);

  const parsedData = await extractStructuredDataWithGemini({
    apiKey: geminiApiKey,
    modelName: geminiModel,
    documentType,
    rawText
  });

  parsedData.documentType = documentType;
  parsedData.items = Array.isArray(parsedData.items) ? parsedData.items : [];

  return {
    rawText,
    parsedData,
    lineItems: mapLineItems(documentType, parsedData)
  };
}

module.exports = {
  parseDocument
};
