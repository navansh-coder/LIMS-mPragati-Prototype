const express = require('express');
const router = express.Router();
const sampleRequestController = require('../controllers/sampleRequestController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');


const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../public/uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


router.use(authMiddleware.protect);


router.post('/', upload.single('sampleImage'), sampleRequestController.createRequest);
router.get('/my-requests', sampleRequestController.getUserRequests);


router.use(authMiddleware.authorize('admin', 'PI'));
router.get('/', sampleRequestController.getAllRequests);
router.patch('/:id/status', sampleRequestController.updateRequestStatus);

module.exports = router;