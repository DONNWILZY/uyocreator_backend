const mongoose = require('mongoose');
require('dotenv').config();

const { LOCAL_DB, VIRTUAL_DB } = process.env;

function connectToDatabase() {
    const uri = process.env.NODE_ENV === 'production' ? VIRTUAL_DB : LOCAL_DB;

    mongoose.connect(uri, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10-second connection timeout
    });

    const db = mongoose.connection;

    db.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        // Reconnection attempt logic can be added here
    });
    
    db.once('open', () => {
        const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
        console.log(`Connected to MongoDB in ${mode} mode`);
    });

    db.once('close', () => {
        console.log('Connection to MongoDB disconnected.');
    });

    return db;
}

module.exports = connectToDatabase;