import multer from "multer";

// Memory storage (required for Vercel + Firebase)
const storage = multer.memoryStorage();

// File filter (optional but recommended)
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

// Final multer config
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});






// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         console.log("File in multer",file);
//       cb(null, "./public/assets")
//     },
//     filename: function (req, file, cb) {
    
//       cb(null, file.originalname)
//     }
//   })
  
//   export  const upload = multer({storage})