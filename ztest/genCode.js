//ztest\genCode.js

const generateCode = require('../utilities/autoGenCode');

const otp = generateCode.generateDigits(6);
const appId = generateCode.generateMixed(10);
const number = generateCode.generateDigits(10);
const alpha = generateCode.generateMixed(10);
const mix = generateCode.generateAlpha(10);



console.log(number)
console.log(alpha)
console.log(mix)