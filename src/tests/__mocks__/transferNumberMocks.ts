
import { TransferNumber } from "@/types/transferNumber";

// Mock transfer number data for tests
export const mockTransferNumbers: TransferNumber[] = [
  {
    id: "1",
    name: "Office Line",
    number: "+1234567890",
    phone_number: "+1234567890",
    description: "Main office number",
    dateAdded: new Date(),
    callCount: 5
  },
  {
    id: "2",
    name: "Mobile",
    number: "+0987654321",
    phone_number: "+0987654321",
    description: "Mobile phone",
    dateAdded: new Date(),
    callCount: 2
  }
];

// Mock the useTransferNumbers hook for tests
export const mockUseTransferNumbers = {
  transferNumbers: mockTransferNumbers,
  isLoading: false,
  isSubmitting: false,
  error: null,
  isInitialLoad: false,
  addTransferNumber: jest.fn(),
  deleteTransferNumber: jest.fn(),
  refreshTransferNumbers: jest.fn()
};
