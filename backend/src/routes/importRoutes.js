const express = require('express');
const verifierToken = require('../middlewares/verificationJeton.js');
const router = express.Router();
const multer = require('multer');
const { importEnseignant, importEnseigner, importMatiere } = require('../controllers/importController');


const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            cb(null, true);
        } else {
            cb(new Error('Format non autorisé. Utilisez un fichier .xlsx'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/enseignant', verifierToken, upload.single('file'), importEnseignant);
router.post('/enseigner', verifierToken, upload.single('file'), importEnseigner);
router.post('/matiere', verifierToken, upload.single('file'), importMatiere);

module.exports = router;