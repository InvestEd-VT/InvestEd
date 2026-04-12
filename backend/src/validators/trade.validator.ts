import { body } from 'express-validator';

/**
 * Trade input validation schemas
 * Validates all trade-related endpoint inputs using express-validator
 * String fields use .trim().escape() for XSS protection (INVESTED-280)
 */

/**
 * Shared symbol validation — 1-5 uppercase letters
 */
const symbolValidation = body('symbol')
  .isString()
  .trim()
  .escape()
  .matches(/^[A-Z]{1,5}$/)
  .withMessage('Symbol must be 1-5 uppercase letters');

/**
 * Shared quantity validation — positive integer, no NaN or Infinity
 */
const quantityValidation = body('quantity')
  .isInt({ min: 1 })
  .withMessage('Quantity must be a positive integer')
  .custom((value) => {
    if (!isFinite(value)) throw new Error('Quantity cannot be Infinity or NaN');
    return true;
  });

/**
 * Shared price validation — positive number, no NaN or Infinity
 */
const priceValidation = body('price')
  .isFloat({ min: 0.01 })
  .withMessage('Price must be a positive number')
  .custom((value) => {
    if (!isFinite(value)) throw new Error('Price cannot be Infinity or NaN');
    return true;
  });

/**
 * Strike price validation — positive number
 */
const strikePriceValidation = body('strikePrice')
  .isFloat({ min: 0.01 })
  .withMessage('Strike price must be a positive number');

/**
 * Expiration date validation — valid ISO date string, must be in the future
 */
const expirationDateValidation = body('expirationDate')
  .isString()
  .trim()
  .escape()
  .isISO8601()
  .withMessage('Expiration date must be a valid ISO date')
  .custom((value) => {
    if (new Date(value) <= new Date()) throw new Error('Expiration date must be in the future');
    return true;
  });

/**
 * Option type validation — CALL or PUT only
 */
const optionTypeValidation = body('optionType')
  .isString()
  .trim()
  .escape()
  .isIn(['CALL', 'PUT'])
  .withMessage('Option type must be CALL or PUT');

/**
 * Buy option validation schema
 * Validates all fields required to purchase an options contract
 */
export const buyOptionSchema = [
  symbolValidation,
  quantityValidation,
  priceValidation,
  strikePriceValidation,
  expirationDateValidation,
  optionTypeValidation,
];

/**
 * Sell option validation schema
 * Validates all fields required to sell an options contract
 */
export const sellOptionSchema = [
  symbolValidation,
  quantityValidation,
  priceValidation,
  strikePriceValidation,
  expirationDateValidation,
  optionTypeValidation,
];
