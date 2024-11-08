require('dotenv/config'); // Load environment variables first
const express = require('express');
const app = express();
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

// Import the user routes
const userRoutes = require('./routes/userRoutes');

const PORT = process.env.PORT || 5000;

app.use(express.json()); // Use express's built-in JSON parser
app.use(cors({
    origin: '*', // Make sure your frontend runs on this URL
    credentials: true,
}));

// Use Helmet for security
app.use(helmet());

// Middleware
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
