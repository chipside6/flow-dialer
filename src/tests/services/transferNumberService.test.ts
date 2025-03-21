
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchUserTransferNumbers, 
  addTransferNumberToDatabase, 
  deleteTransferNumberFromDatabase 
} from '@/services/transferNumberService';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  },
}));

describe('transferNumberService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserTransferNumbers', () => {
    test('should fetch and format transfer numbers', async () => {
      const mockData = [
        { 
          id: '1', 
          name: 'Test Name', 
          phone_number: '123-456-7890', 
          description: 'Test description',
          created_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue(Promise.resolve({ data: mockData, error: null })),
      });
      
      const result = await fetchUserTransferNumbers('user-id');
      
      expect(supabase.from).toHaveBeenCalledWith('transfer_numbers');
      expect(result).toEqual([
        {
          id: '1',
          name: 'Test Name',
          number: '123-456-7890',
          description: 'Test description',
          dateAdded: expect.any(Date),
          callCount: 0
        }
      ]);
    });

    test('should handle null description', async () => {
      const mockData = [
        { 
          id: '1', 
          name: 'Test Name', 
          phone_number: '123-456-7890', 
          description: null,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue(Promise.resolve({ data: mockData, error: null })),
      });
      
      const result = await fetchUserTransferNumbers('user-id');
      
      expect(result[0].description).toBe('No description provided');
    });

    test('should throw error when database returns error', async () => {
      const mockError = new Error('Database error');
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue(Promise.resolve({ data: null, error: mockError })),
      });
      
      await expect(fetchUserTransferNumbers('user-id')).rejects.toThrow();
    });
  });

  describe('addTransferNumberToDatabase', () => {
    test('should add and return a new transfer number', async () => {
      const mockData = [
        { 
          id: '1', 
          name: 'Test Name', 
          phone_number: '123-456-7890', 
          description: 'Test description',
          created_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnValue(Promise.resolve({ data: mockData, error: null })),
      });
      
      const result = await addTransferNumberToDatabase(
        'user-id',
        'Test Name',
        '123-456-7890',
        'Test description'
      );
      
      expect(supabase.from).toHaveBeenCalledWith('transfer_numbers');
      expect(result).toEqual({
        id: '1',
        name: 'Test Name',
        number: '123-456-7890',
        description: 'Test description',
        dateAdded: expect.any(Date),
        callCount: 0
      });
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnValue(Promise.resolve({ data: null, error: mockError })),
      });
      
      await expect(addTransferNumberToDatabase(
        'user-id',
        'Test Name',
        '123-456-7890',
        'Test description'
      )).rejects.toThrow();
    });

    test('should return null when no data is returned', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnValue(Promise.resolve({ data: [], error: null })),
      });
      
      const result = await addTransferNumberToDatabase(
        'user-id',
        'Test Name',
        '123-456-7890',
        'Test description'
      );
      
      expect(result).toBeNull();
    });
  });

  describe('deleteTransferNumberFromDatabase', () => {
    test('should delete a transfer number successfully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation(function() {
          return this;
        }).mockReturnValue(Promise.resolve({ error: null })),
      });
      
      const result = await deleteTransferNumberFromDatabase('user-id', 'transfer-id');
      
      expect(supabase.from).toHaveBeenCalledWith('transfer_numbers');
      expect(result).toBe(true);
    });

    test('should handle database error', async () => {
      const mockError = new Error('Database error');
      
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation(function() {
          return this;
        }).mockReturnValue(Promise.resolve({ error: mockError })),
      });
      
      await expect(deleteTransferNumberFromDatabase('user-id', 'transfer-id')).rejects.toThrow();
    });
  });
});
