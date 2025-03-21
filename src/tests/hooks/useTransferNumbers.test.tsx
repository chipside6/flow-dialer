
import { renderHook } from '@testing-library/react-hooks';
import { useTransferNumbers } from '@/hooks/useTransferNumbers';
import { useTransferNumbersState } from '@/hooks/transfer-numbers/useTransferNumbersState';
import { useFetchTransferNumbers } from '@/hooks/transfer-numbers/useFetchTransferNumbers';
import { useAddTransferNumber } from '@/hooks/transfer-numbers/useAddTransferNumber';
import { useDeleteTransferNumber } from '@/hooks/transfer-numbers/useDeleteTransferNumber';

// Mock all dependency hooks
jest.mock('@/hooks/transfer-numbers/useTransferNumbersState', () => ({
  useTransferNumbersState: jest.fn(),
}));

jest.mock('@/hooks/transfer-numbers/useFetchTransferNumbers', () => ({
  useFetchTransferNumbers: jest.fn(),
}));

jest.mock('@/hooks/transfer-numbers/useAddTransferNumber', () => ({
  useAddTransferNumber: jest.fn(),
}));

jest.mock('@/hooks/transfer-numbers/useDeleteTransferNumber', () => ({
  useDeleteTransferNumber: jest.fn(),
}));

jest.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useTransferNumbers', () => {
  // Set up mock return values
  const mockRefreshTransferNumbers = jest.fn();
  const mockFetchTransferNumbers = jest.fn();
  const mockAddTransferNumber = jest.fn();
  const mockDeleteTransferNumber = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useTransferNumbersState as jest.Mock).mockReturnValue({
      transferNumbers: [{ id: '1', name: 'Test', number: '123' }],
      isLoading: false,
      isSubmitting: false,
      error: null,
      setTransferNumbers: jest.fn(),
      setIsLoading: jest.fn(),
      setIsSubmitting: jest.fn(),
      setError: jest.fn(),
      lastRefresh: Date.now(),
      refreshTransferNumbers: mockRefreshTransferNumbers,
    });
    
    (useFetchTransferNumbers as jest.Mock).mockReturnValue({
      fetchTransferNumbers: mockFetchTransferNumbers,
    });
    
    (useAddTransferNumber as jest.Mock).mockReturnValue({
      addTransferNumber: mockAddTransferNumber,
    });
    
    (useDeleteTransferNumber as jest.Mock).mockReturnValue({
      deleteTransferNumber: mockDeleteTransferNumber,
    });
  });

  test('should combine all hooks correctly', () => {
    const { result } = renderHook(() => useTransferNumbers());
    
    // Check if the hook returns the expected structure
    expect(result.current).toHaveProperty('transferNumbers');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isSubmitting');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('addTransferNumber');
    expect(result.current).toHaveProperty('deleteTransferNumber');
    expect(result.current).toHaveProperty('refreshTransferNumbers');
    
    // Check if the returned functions are the ones from the individual hooks
    expect(result.current.addTransferNumber).toBe(mockAddTransferNumber);
    expect(result.current.deleteTransferNumber).toBe(mockDeleteTransferNumber);
    expect(result.current.refreshTransferNumbers).toBe(mockRefreshTransferNumbers);
  });

  test('should trigger fetchTransferNumbers on initial render', () => {
    renderHook(() => useTransferNumbers());
    
    // fetchTransferNumbers should be called initially
    expect(mockFetchTransferNumbers).toHaveBeenCalled();
  });

  test('should handle null user', () => {
    jest.resetModules();
    
    // Mock useAuth with no user
    jest.mock('@/contexts/auth', () => ({
      useAuth: () => ({
        user: null,
      }),
    }), { virtual: true });
    
    const mockSetTransferNumbers = jest.fn();
    const mockSetIsLoading = jest.fn();
    const mockSetError = jest.fn();
    
    (useTransferNumbersState as jest.Mock).mockReturnValue({
      transferNumbers: [],
      setTransferNumbers: mockSetTransferNumbers,
      setIsLoading: mockSetIsLoading,
      setError: mockSetError,
      lastRefresh: Date.now(),
    });
    
    renderHook(() => useTransferNumbers());
    
    // When no user, these functions should be called to reset state
    expect(mockSetTransferNumbers).toHaveBeenCalledWith([]);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(mockSetError).toHaveBeenCalledWith(null);
  });
});
