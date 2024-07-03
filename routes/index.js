const router = require('express').Router();
const authRouter = require('./auth/auth');
const burnsRouter = require('./burn/burns');
const municipalityRouter = require('./municipality/municipality');
const contactRouter = require('./contact-us/contact-us');
const photoRouter = require('./photo/photo');

router.use('/auth', authRouter);
router.use('/burns', burnsRouter);
router.use('/municipality', municipalityRouter);
router.use('/contact', contactRouter);
router.use('/photo', photoRouter);

module.exports = router;