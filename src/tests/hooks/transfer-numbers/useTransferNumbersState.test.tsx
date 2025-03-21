
import { renderHook, act } from '@testing-library/react-hooks';
import { useTransferNumbersState } from '@/hooks/transfer-numbers/useTransferNumbersState';

describe('useTransferNumbersState', () => {
  test('should initialize with default values', () => {
    const { result } = renderHook(() => useTransferNumbersState());
    
    expect(result.current.transferNumbers).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should handle refresh trigger', () => {
    const { result } = renderHook(() => useTransferNumbersState());
    
    // Store initial refresh timestamp
    const initialLastRefresh = result.current.lastRefresh;
    
    // Act - call refreshTransferNumbers
    act(() => {
      result.current.refreshTransferNumbers();
    });
    
    // Assert the lastRefresh timestamp has been updated
    expect(result.current.lastRefresh).not.toBe(initialLastRefresh);
  });

  test('should reset isLoading after timeout', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useTransferNumbersState());
    
    // Initially loading should be true
    expect(result.current.isLoading).toBe(true);
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(11000); // Past the 10-second timeout
    });
    
    // Loading should now be false
    expect(result.current.isLoading).toBe(false);
    
    jest.useRealTimers();
  });

  test('should reset isSubmitting after timeout', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useTransferNumbersState());
    
    // Set isSubmitting to true
    act(() => {
      result.current.setIsSubmitting(true);
    });
    
    expect(result.current.isSubmitting).toBe(true);
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(6000); // Past the 5-second timeout
    });
    
    // isSubmitting should now be false
    expect(result.current.isSubmitting).toBe(false);
    
    jest.useRealTimers();
  });
});
