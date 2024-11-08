require('dotenv/config'); // Load environment variables first
const express = require('express');
const app = express();
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');


const userRoutes = require('./routes/userRoutes');

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin: '*', 
    credentials: true,
}));


app.use(helmet());

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.use('/api/users', userRoutes);

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
