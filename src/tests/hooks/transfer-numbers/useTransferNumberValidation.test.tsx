
import { renderHook } from '@testing-library/react-hooks';
import { useTransferNumberValidation } from '@/hooks/transfer-numbers/useTransferNumberValidation';
import { toast } from '@/components/ui/use-toast';

// Mock the toast function
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

describe('useTransferNumberValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should validate correct input successfully', () => {
    const { result } = renderHook(() => useTransferNumberValidation());
    
    const isValid = result.current.validateTransferNumberInput('Test Name', '+1234567890');
    
    expect(isValid).toBe(true);
    expect(toast).not.toHaveBeenCalled();
  });

  test('should fail validation for missing name', () => {
    const { result } = renderHook(() => useTransferNumberValidation());
    
    const isValid = result.current.validateTransferNumberInput('', '+1234567890');
    
    expect(isValid).toBe(false);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Missing information',
        variant: 'destructive',
      })
    );
  });

  test('should fail validation for missing number', () => {
    const { result } = renderHook(() => useTransferNumberValidation());
    
    const isValid = result.current.validateTransferNumberInput('Test Name', '');
    
    expect(isValid).toBe(false);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Missing information',
        variant: 'destructive',
      })
    );
  });

  test('should fail validation for invalid phone number format', () => {
    const { result } = renderHook(() => useTransferNumberValidation());
    
    const isValid = result.current.validateTransferNumberInput('Test Name', 'not-a-number');
    
    expect(isValid).toBe(false);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Invalid phone number',
        variant: 'destructive',
      })
    );
  });

  test('should accept valid phone number formats', () => {
    const { result } = renderHook(() => useTransferNumberValidation());
    
    // Test various valid formats
    expect(result.current.validateTransferNumberInput('Test', '+1 (555) 123-4567')).toBe(true);
    expect(result.current.validateTransferNumberInput('Test', '555-123-4567')).toBe(true);
    expect(result.current.validateTransferNumberInput('Test', '(555) 123-4567')).toBe(true);
    expect(result.current.validateTransferNumberInput('Test', '+447890123456')).toBe(true);
  });
});
