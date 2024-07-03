const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const uploadLink = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ajuste o limite de tamanho conforme necessário
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Erro: Apenas são permitidos arquivos de imagem!');
    }
  },
});

module.exports = uploadLink;