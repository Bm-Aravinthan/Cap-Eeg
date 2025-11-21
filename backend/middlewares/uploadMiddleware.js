const multer = require('multer');

// Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// File filter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only .jpeg, .jpg and .png formats are allowed'), false);
//   }
// };

// const upload = multer({ storage, fileFilter });
const upload = multer({ storage: multer.diskStorage({}) });

module.exports = {
  uploadMultiple: upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "document", maxCount: 1 },
  ]),
};

// module.exports = upload;