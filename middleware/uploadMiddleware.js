const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// ABSOLUTE UPLOAD PATH
// =====================================================

const uploadPath = path.join(
  __dirname,
  "../uploads"
);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

// =====================================================
// STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      unique +
        path.extname(
          file.originalname
        ).toLowerCase()
    );
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedExtensions =
    /jpg|jpeg|png|webp/;

  const extension =
    path
      .extname(file.originalname)
      .toLowerCase();

  const isAllowed =
    allowedExtensions.test(extension);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only jpg, jpeg, png and webp images are allowed"
      )
    );
  }
};

// =====================================================
// MULTER
// =====================================================

module.exports = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});