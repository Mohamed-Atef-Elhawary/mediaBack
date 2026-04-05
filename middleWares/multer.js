import multer from "multer";

// const storage = multer.memoryStorage();

// const upload = multer({ storage });

// export default upload;

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
export default upload;
