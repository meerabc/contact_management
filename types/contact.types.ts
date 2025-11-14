// created these custom types for our ease and to ensure consistency, we use these types as
// parameters or return types of functions instead of writing manually for each function
// and there might become risk of inconsistency

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface CreateContactInput {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateContactInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ContactResponse {
  success: boolean;
  data?: Contact;
  error?: string;
}

export interface ContactListResponse {
  success: boolean;
  data?: Contact[];
  total?: number;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}
