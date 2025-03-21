
import { renderHook } from '@testing-library/react-hooks';
import { useFetchTransferNumbers } from '@/hooks/transfer-numbers/useFetchTransferNumbers';
import { fetchUserTransferNumbers } from '@/services/transferNumberService';
import { toast } from '@/components/ui/use-toast';

// Mock dependencies
jest.mock('@/services/transferNumberService', () => ({
  fetchUserTransferNumbers: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useFetchTransferNumbers', () => {
  const mockSetTransferNumbers = jest.fn();
  const mockSetIsLoading = jest.fn();
  const mockSetError = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch transfer numbers successfully', async () => {
    const mockTransferNumbers = [
      { id: '1', name: 'Test', number: '123', description: 'Test', dateAdded: new Date(), callCount: 0 }
    ];
    
    (fetchUserTransferNumbers as jest.Mock).mockResolvedValueOnce(mockTransferNumbers);
    
    const { result } = renderHook(() => 
      useFetchTransferNumbers(mockSetTransferNumbers, mockSetIsLoading, mockSetError)
    );
    
    await result.current.fetchTransferNumbers();
    
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(fetchUserTransferNumbers).toHaveBeenCalledWith('test-user-id');
    expect(mockSetTransferNumbers).toHaveBeenCalledWith(mockTransferNumbers);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  test('should handle error when fetching transfer numbers', async () => {
    const error = new Error('Failed to fetch');
    (fetchUserTransferNumbers as jest.Mock).mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => 
      useFetchTransferNumbers(mockSetTransferNumbers, mockSetIsLoading, mockSetError)
    );
    
    await result.current.fetchTransferNumbers();
    
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockSetError).toHaveBeenCalledWith('Failed to load transfer numbers');
    expect(mockSetTransferNumbers).toHaveBeenCalledWith([]);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error loading transfer numbers',
        variant: 'destructive',
      })
    );
  });

  test('should do nothing if no user is logged in', async () => {
    jest.resetModules();
    
    // Mock useAuth with no user
    jest.mock('@/contexts/auth', () => ({
      useAuth: () => ({
        user: null,
      }),
    }), { virtual: true });
    
    const { result } = renderHook(() => 
      useFetchTransferNumbers(mockSetTransferNumbers, mockSetIsLoading, mockSetError)
    );
    
    await result.current.fetchTransferNumbers();
    
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(fetchUserTransferNumbers).not.toHaveBeenCalled();
  });
});
