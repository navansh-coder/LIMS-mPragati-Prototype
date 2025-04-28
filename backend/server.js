const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
//console.log('MongoDB URI:', process.env.MONGO_URI);
const connectDB = require('./config/db');
const path = require('path');

require('dotenv').config({ path: './.env' }); 
connectDB();
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '/public')));
// Body parser
app.use(express.json());
//helper function to mount routers 
app.use('/api/v1/auth', require('./routes/authRoutes'));
//routes fr Sample request
app.use('/api/requests', require('./routes/sampleRequestRoutes'));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});


app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});


process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

