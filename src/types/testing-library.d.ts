
/**
 * Type declarations for testing libraries
 */

// Explicitly declare Jest globals to make TypeScript happy
declare global {
  const describe: (name: string, fn: () => void) => void;
  const beforeEach: (fn: () => void) => void;
  const afterEach: (fn: () => void) => void;
  const beforeAll: (fn: () => void) => void;
  const afterAll: (fn: () => void) => void;
  const test: (name: string, fn: () => Promise<void> | void, timeout?: number) => void;
  const it: typeof test;
  const expect: jest.Expect;
  
  namespace jest {
    interface Expect {
      (actual: any): jest.Matchers<void>;
    }
    
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(count: number): R;
      toBeDefined(): R;
      toBeNull(): R;
      toContain(expected: any): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeGreaterThan(expected: number): R;
      toBeLessThan(expected: number): R;
      toMatch(expected: string | RegExp): R;
      toThrow(expected?: string | Error | RegExp): R;
      not: Matchers<R>;
      resolves: Matchers<Promise<R>>;
      rejects: Matchers<Promise<R>>;
      toHaveLength(length: number): R;
      toMatchObject(object: any): R;
      toStrictEqual(expected: any): R;
      toBeInstanceOf(expected: any): R;
      toHaveProperty(keyPath: string, value?: any): R;
      toContainEqual(expected: any): R;
    }
    
    type Mock<T, Y extends any[]> = {
      (...args: Y): T;
      mock: {
        calls: Y[];
        instances: T[];
        invocationCallOrder: number[];
        results: { type: string; value: T }[];
      };
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
      mockImplementationOnce(fn: (...args: Y) => T): Mock<T, Y>;
      mockReturnThis(): Mock<T, Y>;
      mockReturnValue(value: T): Mock<T, Y>;
      mockReturnValueOnce(value: T): Mock<T, Y>;
      mockResolvedValue<U>(value: U): Mock<Promise<U>, Y>;
      mockResolvedValueOnce<U>(value: U): Mock<Promise<U>, Y>;
      mockRejectedValue(value: any): Mock<Promise<any>, Y>;
      mockRejectedValueOnce(value: any): Mock<Promise<any>, Y>;
    };
    
    type SpyInstance<T, Y extends any[]> = {
      (...args: Y): T;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: Y) => T): SpyInstance<T, Y>;
      mockImplementationOnce(fn: (...args: Y) => T): SpyInstance<T, Y>;
      mockReturnThis(): SpyInstance<T, Y>;
      mockReturnValue(value: T): SpyInstance<T, Y>;
      mockReturnValueOnce(value: T): SpyInstance<T, Y>;
      mockResolvedValue<U>(value: U): SpyInstance<Promise<U>, Y>;
      mockResolvedValueOnce<U>(value: U): SpyInstance<Promise<U>, Y>;
      mockRejectedValue(value: any): SpyInstance<Promise<any>, Y>;
      mockRejectedValueOnce(value: any): SpyInstance<Promise<any>, Y>;
    };
    
    const fn: <T, Y extends any[]>(implementation?: (...args: Y) => T) => Mock<T, Y>;
    const spyOn: <T, M extends keyof T>(object: T, method: M) => SpyInstance<Required<T>[M], any[]>;
    const setTimeout: (timeout: number) => void;
    const clearAllTimers: () => void;
    const useFakeTimers: () => void;
    const useRealTimers: () => void;
    const runAllTimers: () => void;
    const advanceTimersByTime: (msToRun: number) => void;
    const resetModules: () => void;
    const mock: <T = any>(moduleName: string, factory?: () => T, options?: { virtual?: boolean }) => jest.Mock;
  }
}

export {};
