const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const routes = require('./routes'); // Use bundled routes/index.js

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

//  Use all routes from /routes/index.js
app.use('/api', routes);

// SPA Fallback for frontend routes
app.get('*', (req, res) => {
  const requestedPath = path.join(__dirname, 'frontend', req.path);
  if (fs.existsSync(requestedPath) && requestedPath.endsWith('.html')) {
    res.sendFile(requestedPath);
  } else {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
});

// Start Server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });