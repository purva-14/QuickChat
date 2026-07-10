const multer = require("multer");
const path = require("path");
const fs = require("fs");

const makeStorage = (folder) => {
  const dest = path.join(__dirname, "..", "uploads", folder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
};

const uploadAvatar = multer({
  storage: makeStorage("avatars"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadMessageImage = multer({
  storage: makeStorage("messages"),
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

module.exports = { uploadAvatar, uploadMessageImage };
