/** Normalised error thrown by every adapter (mock or HTTP). UI only ever sees this shape. */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const ErrorCodes = Object.freeze({
  NETWORK: 'NETWORK',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_OTP: 'INVALID_OTP',
  ALREADY_CLAIMED: 'ALREADY_CLAIMED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
});
