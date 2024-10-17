//puppeteerConfig.js

const { join } = require('path');

const cacheDirectory = join(__dirname, '.cache', 'puppeteer');
console.log('Cache Directory:', cacheDirectory);

module.exports = {
  cacheDirectory,
};