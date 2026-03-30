# Three-Way Match Backend

A clean Node.js + Express + MongoDB backend for PO, GRN, and Invoice uploads.

## What it does

- uploads PO, GRN, and Invoice files
- extracts text from the uploaded file
- uses Gemini to convert the document into structured JSON
- stores parsed documents in MongoDB
- links documents by `poNumber`
- recomputes the latest three-way match state whenever a related document arrives
- works even when files arrive out of order

## Tech stack

- Node.js
- Express
- MongoDB + Mongoose
- Gemini API
- Multer
- PDF text extraction with `pdf-parse`
- DOCX extraction with `mammoth`

## Project structure

```bash
three-way-match-backend/
├── examples/
├── public/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── package.json
├── .env.example
└── README.md
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env`

```bash
cp .env.example .env
```

3. Add your values

- `MONGODB_URI`
- `GEMINI_API_KEY`

4. Start MongoDB locally or use your MongoDB Atlas URI

5. Run the server

```bash
npm run dev
```

Server starts on:

```bash
http://localhost:5000
```

API docs:

```bash
http://localhost:5000/api-docs
```

## API endpoints

### 1) Upload document

`POST /documents/upload`

Form-data:

- `file`
- `documentType` = `po` | `grn` | `invoice`

### 2) Get parsed document

`GET /documents/:id`

### 3) Get match result by PO number

`GET /match/:poNumber`

### 4) Health check

`GET /health`

## Matching logic

Matching is done at the item level.

### Item matching key

I use:

1. `itemCode` or `sku` if available
2. fallback to a normalized description

This is the safest choice because the provided documents already contain stable product codes in most rows.

### Validation rules

- GRN quantity must not be greater than PO quantity
- Invoice quantity must not be greater than total GRN quantity
- Invoice quantity must not be greater than PO quantity
- Invoice date must not be after PO date

### Statuses

- `matched`
- `partially_matched`
- `mismatch`
- `insufficient_documents`

### Out-of-order uploads

The backend stores each parsed document independently. After every upload, it recomputes the match state for the same `poNumber`, so the upload order does not matter.

## Example payloads

Examples are included in the `examples/` folder.

## Tradeoffs

- Gemini gives the best extraction quality, but the final JSON still depends on prompt quality and document readability.
- The project stores parsed JSON exactly as returned, so the backend stays simple and explainable.
- OCR is not included. For scanned PDFs, adding OCR later would improve extraction.
- The matching engine is strict and deterministic so the output is easy to audit.

## How to use in Postman

- Set `POST /documents/upload`
- Use `form-data`
- Add `file`
- Add `documentType`

## Notes

The project is ready for local development and can be extended with authentication, job queues, and a richer UI later.
