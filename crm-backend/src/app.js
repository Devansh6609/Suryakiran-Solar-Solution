
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiRouter = require('./api/routes');

const app = express();

// --- Middlewares ---
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PATCH,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Static File Serving ---
app.use('/files', express.static(path.join(__dirname, '../uploads')));

// --- API Routes ---
app.use('/api', apiRouter);

module.exports = app;
