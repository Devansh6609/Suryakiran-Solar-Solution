
const express = require('express');
const authRoutes = require('./auth.routes');
const publicRoutes = require('./public.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', publicRoutes); // For forms, locations, public lead creation
router.use('/admin', adminRoutes); // For all protected admin routes

module.exports = router;
