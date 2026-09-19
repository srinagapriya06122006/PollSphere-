/**
 * Gmail validation utility
 * Accepts only valid Gmail addresses: username@gmail.com
 * Username allowed characters: a-z, A-Z, 0-9, dot (.), underscore (_)
 */
export const GMAIL_REGEX = /^[a-zA-Z0-9._]+@gmail\.com$/

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return {
      isValid: false,
      error: 'Please enter a valid Gmail address (example: username@gmail.com)',
    }
  }

  const trimmed = email.trim()

  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Gmail address cannot contain spaces',
    }
  }

  if (!GMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid Gmail address (example: username@gmail.com)',
    }
  }

  return {
    isValid: true,
    error: null,
  }
}

export default validateEmail
