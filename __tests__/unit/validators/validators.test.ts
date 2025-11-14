/**
 * Validator Unit Tests
 *
 * Tests for contact and task validators:
 * - ContactValidator.validateCreateInput
 * - ContactValidator.validateUpdateInput
 * - TaskValidator.validateCreateInput
 * - TaskValidator.validateUpdateInput
 *
 * Validates all business rules for data integrity
 */

import ContactValidator from '@/lib/validators/contact.validator';
import TaskValidator from '@/lib/validators/task.validator';

// Helper to get a future date (tomorrow)
function getFutureDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('Contact Validator', () => {
  describe('validateCreateInput', () => {
    const validInput = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      address: '123 Main Street, City, State 12345',
    };

    it('should pass validation for valid input', () => {
      const result = ContactValidator.validateCreateInput(validInput);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail if name is empty', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        name: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('should fail if name is too short', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        name: 'a',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('should fail if name is too long', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        name: 'a'.repeat(101),
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('should fail if email is invalid', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        email: 'not-an-email',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should fail if email is empty', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        email: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should fail if phone format is invalid', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        phone: 'invalid-phone',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'phone')).toBe(true);
    });

    it('should accept valid phone format 555-XXXX', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        phone: '555-9999',
      });

      expect(result.isValid).toBe(true);
    });

    it('should fail if address is too short', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        address: 'ab',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'address')).toBe(true);
    });

    it('should fail if address is too long', () => {
      const result = ContactValidator.validateCreateInput({
        ...validInput,
        address: 'a'.repeat(201),
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'address')).toBe(true);
    });

    it('should return multiple errors at once', () => {
      const result = ContactValidator.validateCreateInput({
        name: '',
        email: 'invalid',
        phone: 'bad',
        address: 'x',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateUpdateInput', () => {
    it('should pass validation with partial update', () => {
      const result = ContactValidator.validateUpdateInput({
        name: 'Jane Doe',
      });

      expect(result.isValid).toBe(true);
    });

    it('should pass validation with empty object', () => {
      const result = ContactValidator.validateUpdateInput({});

      expect(result.isValid).toBe(true);
    });

    it('should validate provided fields', () => {
      const result = ContactValidator.validateUpdateInput({
        email: 'invalid-email',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'email')).toBe(true);
    });
  });
});

describe('Task Validator', () => {
  describe('validateCreateInput', () => {
    const validInput = {
      contactId: '1',
      title: 'Follow up on project',
      description: 'Check status with client',
      dueDate: getFutureDate(),
    };

    it('should pass validation for valid input', () => {
      const result = TaskValidator.validateCreateInput(validInput);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation without optional fields', () => {
      const result = TaskValidator.validateCreateInput({
        contactId: '1',
        title: 'Follow up',
      });

      expect(result.isValid).toBe(true);
    });

    it('should fail if title is empty', () => {
      const result = TaskValidator.validateCreateInput({
        ...validInput,
        title: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('should fail if title is too short', () => {
      const result = TaskValidator.validateCreateInput({
        ...validInput,
        title: 'a',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('should fail if title is too long', () => {
      const result = TaskValidator.validateCreateInput({
        ...validInput,
        title: 'a'.repeat(201),
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('should fail if contactId is empty', () => {
      const result = TaskValidator.validateCreateInput({
        ...validInput,
        contactId: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'contactId')).toBe(true);
    });

    it('should fail if description is too long', () => {
      const result = TaskValidator.validateCreateInput({
        ...validInput,
        description: 'a'.repeat(501),
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'description')).toBe(true);
    });

    it('should fail if dueDate format is invalid', () => {
      const result = TaskValidator.validateCreateInput({
        ...validInput,
        dueDate: 'not-a-date',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'dueDate')).toBe(true);
    });

    it('should accept valid ISO date format', () => {
      const result = TaskValidator.validateCreateInput({
        ...validInput,
        dueDate: getFutureDate(),
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateUpdateInput', () => {
    it('should pass validation with partial update', () => {
      const result = TaskValidator.validateUpdateInput({
        title: 'Updated title',
      });

      expect(result.isValid).toBe(true);
    });

    it('should pass validation with completed flag', () => {
      const result = TaskValidator.validateUpdateInput({
        completed: true,
      });

      expect(result.isValid).toBe(true);
    });

    it('should validate provided fields', () => {
      const result = TaskValidator.validateUpdateInput({
        title: 'a',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });
  });
});
