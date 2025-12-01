import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
  cloud_name: 'damljwkim',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'my-app-uploads',
    // 'auto' allows Cloudinary to detect if it's a PDF (raw) or an Image
    resource_type: 'auto', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], // Add 'pdf' here
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || 
      file.mimetype === 'image/png' || 
      file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG, PNG and PDF is allowed!'), false);
  }
};


const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter 
});

module.exports = upload;