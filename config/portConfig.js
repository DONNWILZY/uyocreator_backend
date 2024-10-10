// config\portConfig.js

const dotenv = require('dotenv');
dotenv.config();



const port = process.env.PORT || 5000;

// URL FOR THE PROJECT
const currentUrl = `http://127.0.0.1:${port}`;



module.exports = {
  port,
  currentUrl
};
