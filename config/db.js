const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

// Connects to MongoDB Atlas using URI in config
const connectDB = () => {
  mongoose.connect(db, {
    useNewUrlParser: true
  })
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = connectDB;