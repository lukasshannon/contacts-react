const express = require('express');

// Initialize server
const app = express();

// Connect MongoDB Atlas database
const connectDB = require('./config/db');
connectDB();

// Server configuration
app.use(express.json({extended: false}))

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));

// Manage port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
