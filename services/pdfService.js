const puppeteer = require('puppeteer');

// Function to generate a PDF from HTML using Puppeteer
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the content of the page to the provided HTML
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate a PDF buffer from the page
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '40px', right: '20px', bottom: '40px', left: '20px' }
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generatePdfFromHtml };
