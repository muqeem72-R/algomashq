// Tunable numbers for the login system.

export const OTP_TTL_SECONDS = 10 * 60;      // a code stops working after 10 minutes
export const OTP_MAX_ATTEMPTS = 5;           // wrong guesses allowed per code
export const RESEND_SECONDS = 60;            // wait between two code requests for one email
export const SESSION_DAYS = 30;              // a session lasts 30 days from the last visit
export const SESSION_RENEW_AFTER_MS = 24 * 60 * 60 * 1000;   // push the expiry forward at most once a day

// Brevo's free plan allows 300 emails a day. Stay safely under it.
export const DAILY_EMAIL_CAP = 250;

export const LIMITS = {
  otpPerIpPerHour: 20,
  otpPerEmailPerHour: 5,
  verifyPerIpPerHour: 40,
  verifyPerEmailPerHour: 20,
  // Looking at other members. Generous for normal use, but stops a script from walking through every user id.
  lookupsPerHour: 300,
  photoFetchesPerHour: 1500
};

export const PHOTO_MAX_BYTES = 100 * 1024;   // after client-side resizing a photo is about 20-40 KB
export const PHOTO_REQUIRED = false;         // a photo is optional: without one the member gets a letter logo
