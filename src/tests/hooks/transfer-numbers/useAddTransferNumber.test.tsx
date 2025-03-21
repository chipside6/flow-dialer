
import { renderHook } from '@testing-library/react-hooks';
import { useAddTransferNumber } from '@/hooks/transfer-numbers/useAddTransferNumber';
import { addTransferNumberToDatabase } from '@/services/transferNumberService';
import { toast } from '@/components/ui/use-toast';
import { useTransferNumberValidation } from '@/hooks/transfer-numbers/useTransferNumberValidation';

// Mock dependencies
jest.mock('@/services/transferNumberService', () => ({
  addTransferNumberToDatabase: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/hooks/transfer-numbers/useTransferNumberValidation', () => ({
  useTransferNumberValidation: jest.fn(),
}));

jest.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useAddTransferNumber', () => {
  const mockSetIsSubmitting = jest.fn();
  const mockRefreshTransferNumbers = jest.fn();
  const mockValidateTransferNumberInput = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock validation to pass by default
    mockValidateTransferNumberInput.mockReturnValue(true);
    (useTransferNumberValidation as jest.Mock).mockReturnValue({
      validateTransferNumberInput: mockValidateTransferNumberInput,
    });
  });

  test('should add transfer number successfully', async () => {
    const mockNewTransferNumber = {
      id: '1',
      name: 'Test',
      number: '123-456-7890',
      description: 'Test description',
      dateAdded: new Date(),
      callCount: 0
    };
    
    (addTransferNumberToDatabase as jest.Mock).mockResolvedValueOnce(mockNewTransferNumber);
    
    const { result } = renderHook(() => 
      useAddTransferNumber(mockSetIsSubmitting, mockRefreshTransferNumbers)
    );
    
    const response = await result.current.addTransferNumber(
      'Test', 
      '123-456-7890', 
      'Test description'
    );
    
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(true);
    expect(mockValidateTransferNumberInput).toHaveBeenCalledWith('Test', '123-456-7890');
    expect(addTransferNumberToDatabase).toHaveBeenCalledWith(
      'test-user-id',
      'Test',
      '123-456-7890',
      'Test description'
    );
    expect(mockRefreshTransferNumbers).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Transfer number added',
      })
    );
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(false);
    expect(response).toEqual(mockNewTransferNumber);
  });

  test('should not add when validation fails', async () => {
    mockValidateTransferNumberInput.mockReturnValue(false);
    
    const { result } = renderHook(() => 
      useAddTransferNumber(mockSetIsSubmitting, mockRefreshTransferNumbers)
    );
    
    const response = await result.current.addTransferNumber('', '', '');
    
    expect(mockValidateTransferNumberInput).toHaveBeenCalled();
    expect(addTransferNumberToDatabase).not.toHaveBeenCalled();
    expect(mockRefreshTransferNumbers).not.toHaveBeenCalled();
    expect(response).toBeNull();
  });

  test('should handle error when adding transfer number', async () => {
    const error = new Error('Failed to add');
    (addTransferNumberToDatabase as jest.Mock).mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => 
      useAddTransferNumber(mockSetIsSubmitting, mockRefreshTransferNumbers)
    );
    
    const response = await result.current.addTransferNumber(
      'Test', 
      '123-456-7890', 
      'Test description'
    );
    
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(true);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error adding transfer number',
        variant: 'destructive',
      })
    );
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(false);
    expect(response).toBeNull();
  });

  test('should handle empty response from database', async () => {
    (addTransferNumberToDatabase as jest.Mock).mockResolvedValueOnce(null);
    
    const { result } = renderHook(() => 
      useAddTransferNumber(mockSetIsSubmitting, mockRefreshTransferNumbers)
    );
    
    const response = await result.current.addTransferNumber(
      'Test', 
      '123-456-7890', 
      'Test description'
    );
    
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error adding transfer number',
        variant: 'destructive',
      })
    );
    expect(response).toBeNull();
  });
});
