const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');

// Route imports
const userRoutes = require('../routes/userRoutes');
const eventRoutes = require('../routes/eventRoutes');
// const blogRoutes = require('../routes/blogRoutes');
// const shopRoutes = require('../routes/shopRoutes');

const routeConfig = (app) => {
    // Middleware
    app.use(express.json());
    // app.use(cors()); // Cross-Origin Resource Sharing
    // app.use(helmet()); // Security headers

    // Routes
    app.use('/api/users', userRoutes);
    app.use('/api/events', eventRoutes);
    // app.use('/api/blogs', blogRoutes);
    // app.use('/api/shop', shopRoutes);

    // Default preview route
    app.get('/', (req, res) => {
        res.send(`
            <h1>Welcome to UYO Creators Club API</h1>
            <p>API is working fine.</p>
        `);
    });
};

module.exports = routeConfig;



