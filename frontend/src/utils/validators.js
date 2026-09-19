/**
 * Email validation utility
 * Complies with standard RFC 5322 regex format and provides granular feedback
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return {
      isValid: false,
      error: 'Email address is required',
    }
  }

  const trimmed = email.trim()

  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Email address cannot contain spaces',
    }
  }

  if (!trimmed.includes('@')) {
    return {
      isValid: false,
      error: 'Email address must include an "@" symbol',
    }
  }

  const parts = trimmed.split('@')
  if (parts.length > 2) {
    return {
      isValid: false,
      error: 'Email cannot contain multiple "@" symbols',
    }
  }

  const [localPart, domain] = parts

  if (!localPart) {
    return {
      isValid: false,
      error: 'Please enter the username part before "@"',
    }
  }

  if (!domain) {
    return {
      isValid: false,
      error: 'Please enter a domain after "@" (e.g. gmail.com)',
    }
  }

  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: 'Please enter a valid domain extension (e.g. .com, .org)',
    }
  }

  const domainParts = domain.split('.')
  const tld = domainParts[domainParts.length - 1]

  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'Domain extension must be at least 2 characters (e.g. .com)',
    }
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g. name@example.com)',
    }
  }

  return {
    isValid: true,
    error: null,
  }
}

export default validateEmail
