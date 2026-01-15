/**
 * Google reCAPTCHA v2 verification utility
 */

/**
 * Verify reCAPTCHA token with Google API
 * @param {string} token - The reCAPTCHA response token from the client
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Skip verification if secret key is not configured (development mode)
  if (!secretKey) {
    console.warn('⚠️ RECAPTCHA_SECRET_KEY not configured - skipping verification');
    return { success: true };
  }

  // Validate token exists
  if (!token) {
    return { success: false, error: 'reCAPTCHA token is required' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return { 
        success: false, 
        error: 'reCAPTCHA verification failed. Please try again.' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { 
      success: false, 
      error: 'Failed to verify reCAPTCHA. Please try again.' 
    };
  }
}
