const express = require('express');
const contactRouter = express.Router();
const { sendContactEmail } = require('../../controllers/contact-us/contact-us');
const authMiddleware = require('../../middlewares/auth');

// Use auth middleware
contactRouter.use(authMiddleware);

// Define the route to send contact email
contactRouter.post('/send-message', sendContactEmail);

module.exports = contactRouter;