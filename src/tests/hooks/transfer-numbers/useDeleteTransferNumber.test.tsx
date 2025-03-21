
import { renderHook } from '@testing-library/react-hooks';
import { useDeleteTransferNumber } from '@/hooks/transfer-numbers/useDeleteTransferNumber';
import { deleteTransferNumberFromDatabase } from '@/services/transferNumberService';
import { toast } from '@/components/ui/use-toast';

// Mock dependencies
jest.mock('@/services/transferNumberService', () => ({
  deleteTransferNumberFromDatabase: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useDeleteTransferNumber', () => {
  const mockRefreshTransferNumbers = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should delete transfer number successfully', async () => {
    (deleteTransferNumberFromDatabase as jest.Mock).mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => 
      useDeleteTransferNumber(mockRefreshTransferNumbers)
    );
    
    const success = await result.current.deleteTransferNumber('test-id');
    
    expect(deleteTransferNumberFromDatabase).toHaveBeenCalledWith('test-user-id', 'test-id');
    expect(mockRefreshTransferNumbers).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Transfer number deleted',
      })
    );
    expect(success).toBe(true);
  });

  test('should handle error when deleting transfer number', async () => {
    const error = new Error('Failed to delete');
    (deleteTransferNumberFromDatabase as jest.Mock).mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => 
      useDeleteTransferNumber(mockRefreshTransferNumbers)
    );
    
    const success = await result.current.deleteTransferNumber('test-id');
    
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error deleting transfer number',
        variant: 'destructive',
      })
    );
    expect(success).toBe(false);
  });

  test('should not attempt to delete if no user is logged in', async () => {
    jest.resetModules();
    
    // Mock useAuth with no user
    jest.mock('@/contexts/auth', () => ({
      useAuth: () => ({
        user: null,
      }),
    }), { virtual: true });
    
    const { result } = renderHook(() => 
      useDeleteTransferNumber(mockRefreshTransferNumbers)
    );
    
    const success = await result.current.deleteTransferNumber('test-id');
    
    expect(deleteTransferNumberFromDatabase).not.toHaveBeenCalled();
    expect(success).toBe(false);
  });
});
