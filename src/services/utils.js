import BigNumber from 'bignumber.js';
import web3Service from './web3Service';

const parseTokenAmount = function(amount, decimals = 0, incoming = true) {
  const factor = new BigNumber(10 ** Number(decimals));
  if (incoming) {
    return new BigNumber(amount.toString()).div(factor);
  } else {
    return new BigNumber(amount.toString()).times(factor);
  }
};

const prettyNumber = function(number) {
  number = typeof number === 'number' ? number : Number(number);
  number = new RegExp('^\\d+\\.?\\d{8,}$').test(number)
    ? number.toFixed(8)
    : number;
  const parts = number.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const totalAmount = function(decimals, recipientAmounts) {
  let total = new BigNumber(0);
  total = recipientAmounts.reduce(
    (a, b) => a.plus(parseTokenAmount(b.toString() || 0, decimals, false)),
    total
  );
  return total.toFixed();
};

const updateArray = function(array, index, value) {
  return array.map((val, ind) => (ind !== index ? val : value));
};

const validateAmount = function(recipientAmount, minimum) {
  return (
    new RegExp('^\\d+\\.?\\d*$').test(recipientAmount) &&
    new BigNumber(recipientAmount).gte(minimum)
  );
};

const validateAmounts = function(recipientAmounts, minimum) {
  let isValid = true;
  if (recipientAmounts.length > 0) {
    recipientAmounts.map(value => {
      if (!validateAmount(value, minimum)) {
        isValid = false;
      }
    });
  }
  return isValid;
};

const validateAddress = function(recipientAddress) {
  return web3Service._web3.utils.isAddress(recipientAddress);
};

const validateAddresses = function(recipientAddresses) {
  let isValid = true;
  if (recipientAddresses.length > 0) {
    recipientAddresses.map(address => {
      if (!validateAddress(address)) {
        isValid = false;
      }
    });
  }
  return isValid;
};

export default {
  parseTokenAmount,
  prettyNumber,
  totalAmount,
  updateArray,
  validateAmount,
  validateAmounts,
  validateAddress,
  validateAddresses,
};
export {
  parseTokenAmount,
  prettyNumber,
  totalAmount,
  updateArray,
  validateAmount,
  validateAmounts,
  validateAddress,
  validateAddresses,
};
