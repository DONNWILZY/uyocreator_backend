/**
 * Auto-generated code utility functions.
 * 
 * @module autoGenCode
 */

/**
 * Generates a random code of specified length and type.
 * 
 * @param {number} [length=8] Length of the generated code.
 * @param {string} [type='mixed'] Type of code to generate ('mixed', 'numbers', or 'alpha').
 * @returns {string} Random code.
 */
function generateCode(length = 8, type = 'mixed') {
  const characterSets = {
    mixed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    numbers: '0123456789',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  };

if (!characterSets[type]) {  //Specific  the error!
    throw new Error(`Invalid type. Use 'mixed', 'numbers', or 'alpha'.`);
  }

  const characters = characterSets[type];
  
  return Array(length).fill(0).map(() => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

const generateCodeUtil = {
  generateMixed: (length) => generateCode(length, 'mixed'),
  generateDigits: (length) => generateCode(length, 'numbers'),
  generateAlpha: (length) => generateCode(length, 'alpha')
};

module.exports = generateCodeUtil;

/* 

USE CASES 
const generateCode = require('./utilities/autoGenCode');

const mixedCode = generateCode.generateMixed(10);
const digitCode = generateCode.generateDigits(6);
const alphaCode = generateCode.generateAlpha(12);

console.log(mixedCode);  // e.g., "4K8dLpM2aG"
console.log(digitCode);  // e.g., "854239"
console.log(alphaCode);  // e.g., "HGFedcbaJKL"
*/