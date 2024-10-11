//utilities\autoGenCode.js


const crypto = require('crypto');

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
  if (typeof length !== 'number' || length <= 0) {
    throw new Error('Length must be a positive integer.');
  }

  const characterSets = {
    mixed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    numbers: '0123456789',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  };

  if (!characterSets[type]) {
    throw new Error(`Invalid type. Use 'mixed', 'numbers', or 'alpha'.`);
  }

  const characters = characterSets[type];
  const code = [];

  for (let i = 0; i < length; i++) {
    const randomByte = crypto.randomBytes(1)[0];
    code.push(characters.charAt(randomByte % characters.length));
  }

  return code.join('');
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