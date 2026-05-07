import { useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import isMockLocation from 'react-native-turbo-mock-location-detector';

export function useMockDetection() {
  const checkMockLocation = useCallback(async (): Promise<boolean> => {
    try {
      const result = await (isMockLocation as any)();
      return result.isMock;
    } catch (e) {
      console.error('Mock detection error:', e);
      return false;
    }
  }, []);

  return { checkMockLocation };
}
