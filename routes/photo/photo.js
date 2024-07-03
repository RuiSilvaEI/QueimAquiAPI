const photoRouter = require('express').Router();
const controller = require('../../controllers/photo/photo');
const authMiddleware = require('../../middlewares/auth');
const uploadLink = require('../../utils/upload');

//use auth middleware
photoRouter.use(authMiddleware);

//photo CRUD
photoRouter.put('/updatephoto/:id', uploadLink.single('photo'), controller.updatePhoto);

module.exports = photoRouter;