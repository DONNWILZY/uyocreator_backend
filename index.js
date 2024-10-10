//config\routesConfig.js

const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
// const {verifyToken, verifyUser, verifyAdmin, verifyStaff, verifySuperAdmin, checkPermission} = require('./middlewares/authMiddleware');

const mongoose  = require('mongoose');

const connectToDatabase = require('./config/dbConfig');
connectToDatabase(); // database function

const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());

// Import route initializer
const initializeRoutes = require('./config/routesConfig');

// Initialize routes
initializeRoutes(app);


// Import port configuration
const { port, currentUrl } = require('./config/portConfig');

// deault route for testing
app.get('/home',   (req, res) =>{
  res.send( `DEFAULT ROUTE IS WORKING`);
  
});


app.listen(port, () => {
  console.log(`Connected on PORT ${port} || ${currentUrl}`);
});