import multer from "multer";

const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 10);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "text/plain",
    "image/png",
    "image/jpeg"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, TXT, PNG and JPG files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeMb * 1024 * 1024
  }
});

export default upload;