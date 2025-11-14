// just a class of ContactValidator for ValidationError(using regex) for each field and then two
// functions as well that utilize these validation functions to set validation state(isValidated)
// and error for each field , useful in form submission error checking
//validateCreateInput function can be used to validate form fields when creating new contact
// validateUpdateInput function can be used to validate form field when updating an existing
// contact
// used for both frontend Validation (before api call made) and backend
// validation to ensure data came correct from frontend , two level validation

import {
  CreateContactInput,
  UpdateContactInput,
  ValidationResult,
  ValidationError,
} from '@/types/contact.types';
import { FUNCTIONS_CONFIG_MANIFEST } from 'next/dist/shared/lib/constants';

class ContactValidator {

  static validatePhone(phone: string): { isValid: boolean; error?: string } {
    // Check 1: Must be a string (TypeScript already ensures this at compile time)
    if (typeof phone !== 'string') {
      return { isValid: false, error: 'Phone must be a string' };
    }
    // Check 2: Must be exactly 8 characters 
    if (phone.length !== 8) {
      return {
        isValid: false,
        error: `Phone must be exactly 8 characters long. You provided ${phone.length} characters.`,
      };
    }
    // Check 3: Must match pattern "555-XXXX" 
    const phoneRegex = /^\d{3}-\d{4}$/; // 3 digits, dash, 4 digits
    if (!phoneRegex.test(phone)) {
      return { isValid: false, error: 'Phone must be in format: 555-0001' };
    }
    return { isValid: true };
  }


  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (typeof email !== 'string') {
      return { isValid: false, error: 'Email must be a string' };
    }
    if (email.length === 0 || email.length > 100) {
      return {
        isValid: false,
        error: 'Email must be between 1-100 characters',
      };
    }
    // simple email regex for text@text.text pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }


  static validateName(name: string): { isValid: boolean; error?: string } {
    if (typeof name !== 'string') {
      return { isValid: false, error: 'Name must be a string' };
    }
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      return {
        isValid: false,
        error: `Name must be between 2-100 characters. You provided ${trimmed.length}`,
      };
    }
    return { isValid: true };
  }


  static validateAddress(address: string): { isValid: boolean; error?: string } {
    if (typeof address !== 'string') {
      return { isValid: false, error: 'Address must be a string' };
    }
    const trimmed = address.trim();
    if (trimmed.length < 5 || trimmed.length > 200) {
      return {
        isValid: false,
        error: `Address must be between 5-200 characters. You provided ${trimmed.length}`,
      };
    }
    return { isValid: true };
  }

  // runs all validators on all fields and then returns array of all errors found 
  static validateCreateInput(input: CreateContactInput): ValidationResult {
    const errors: ValidationError[] = [];

    const nameValidation = this.validateName(input.name);
    if (!nameValidation.isValid) {
      errors.push({ field: 'name', message: nameValidation.error || '' });
    }

    const emailValidation = this.validateEmail(input.email);
    if (!emailValidation.isValid) {
      errors.push({ field: 'email', message: emailValidation.error || '' });
    }

    const phoneValidation = this.validatePhone(input.phone);
    if (!phoneValidation.isValid) {
      errors.push({ field: 'phone', message: phoneValidation.error || '' });
    }

    const addressValidation = this.validateAddress(input.address);
    if (!addressValidation.isValid) {
      errors.push({ field: 'address', message: addressValidation.error || '' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  //only validates fields that are being updated
  static validateUpdateInput(input: UpdateContactInput): ValidationResult {
    const errors: ValidationError[] = [];

    if (input.name !== undefined) {
      const validation = this.validateName(input.name);
      if (!validation.isValid) {
        errors.push({ field: 'name', message: validation.error || '' });
      }
    }

    if (input.email !== undefined) {
      const validation = this.validateEmail(input.email);
      if (!validation.isValid) {
        errors.push({ field: 'email', message: validation.error || '' });
      }
    }

    if (input.phone !== undefined) {
      const validation = this.validatePhone(input.phone);
      if (!validation.isValid) {
        errors.push({ field: 'phone', message: validation.error || '' });
      }
    }

    if (input.address !== undefined) {
      const validation = this.validateAddress(input.address);
      if (!validation.isValid) {
        errors.push({ field: 'address', message: validation.error || '' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ContactValidator;

