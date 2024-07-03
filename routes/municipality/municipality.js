const municipalityRouter = require('express').Router();
const controller = require('../../controllers/municipality/municipality');
const authMiddleware = require('../../middlewares/auth');

//use auth middleware
municipalityRouter.use(authMiddleware);

//municipalities CRUD
municipalityRouter.get('/', controller.getAll); //read all
municipalityRouter.get('/:number', controller.getById); //read one by his id (municipality number)
municipalityRouter.get('/responsible/:userId', controller.getByResponsibleUserId); // Read municipality by responsible user id
municipalityRouter.post('/create', controller.create); //create new municipality
municipalityRouter.put('/update/:number', controller.update); //update municipality
municipalityRouter.delete('/delete/:number', controller.delete); //delete municipality

module.exports = municipalityRouter;