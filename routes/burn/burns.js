const burnRouter = require('express').Router();
const controller = require('../../controllers/burn/burn');
const authMiddleware = require('../../middlewares/auth');

//use auth middleware
burnRouter.use(authMiddleware);

//burns CRUD
burnRouter.get('/', controller.getAll); //read all
burnRouter.get('/:number', controller.getById); //read one by his id (burn number)
burnRouter.get('/user/:id', controller.getByUser); //read one by his id (burn number)
burnRouter.get('/user/:userId/type/:type', controller.getByUserAndType); //read burns by user and type
burnRouter.get('/type/:type', controller.getByType); // Read all burns by type
burnRouter.get('/state/:state/type/:type', controller.getByStateAndType); // Read burns by state and type
burnRouter.get('/state/:state/concelho/:concelho', controller.getByStateAndConcelho); // Read burns by state and concelho
burnRouter.get('/state/:state/concelho/:concelho/type/:type', controller.getByStateConcelhoAndType); // Read burns by state, concelho, and type
burnRouter.get('/concelho/:concelho', controller.getByConcelho); // Read burns by concelho
burnRouter.get('/count/:userId', controller.getNumberOfBurnRequests); // Get number of burn requests
burnRouter.put('/:id/state/:state', controller.updateBurnState); // Update burn state
burnRouter.get('/state/:state', controller.getByState); // Read burns by state
burnRouter.post('/create', controller.create); //create new burn
burnRouter.delete('/delete/:number', controller.delete); //delete burn

module.exports = burnRouter;