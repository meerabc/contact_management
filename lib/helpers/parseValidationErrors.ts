/**
 * Parse validation errors from API response
 * 
 * API returns errors in format: "Validation failed: name: Error message; email: Error message"
 * This function parses it into a map of field -> error message
 */
export function parseValidationErrors(errorMessage: string): Record<string, string> {
  const errors: Record<string, string> = {};

  // Check if it's a validation error
  if (!errorMessage || !errorMessage.includes('Validation failed:')) {
    return errors;
  }

  // Extract the part after "Validation failed: "
  const errorPart = errorMessage.replace('Validation failed: ', '').trim();

  if (!errorPart) {
    return errors;
  }

  // Split by semicolon to get individual field errors
  const fieldErrors = errorPart.split('; ');

  fieldErrors.forEach((fieldError) => {
    // Each error is in format "field: message"
    // Split on first colon only to handle messages that might contain colons
    const colonIndex = fieldError.indexOf(':');
    if (colonIndex > 0) {
      const field = fieldError.substring(0, colonIndex).trim();
      const message = fieldError.substring(colonIndex + 1).trim();
      if (field && message) {
        errors[field] = message;
      }
    }
  });

  return errors;
}

