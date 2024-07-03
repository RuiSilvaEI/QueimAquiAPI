const authRouter = require('express').Router();
const controller = require('../../controllers/auth/auth');
const authMiddleware = require('../../middlewares/auth');

authRouter.post('/signin', controller.signin);
authRouter.post('/signup', controller.signup);

authRouter.get('/users', authMiddleware, controller.getAllUsers);
authRouter.get('/user/:id', authMiddleware, controller.getUser);
authRouter.put('/updateuser/:id', authMiddleware, controller.updateUser);
authRouter.put('/changepassword/:id', authMiddleware, controller.changePassword);
authRouter.put('/changepasswordicnf/:id', authMiddleware, controller.changePasswordIcnf);
authRouter.put('/updatestate/:id', authMiddleware, controller.updateUserState);
authRouter.post('/forgotpassword', controller.forgotPassword);
authRouter.post('/resetpassword/verify', controller.verifyResetToken);
authRouter.post('/resetpassword', controller.resetPassword);

module.exports = authRouter;