import { TestIds } from 'react-native-google-mobile-ads';
import { useAdStore } from '@/store/adStore';

const AD_UNIT_IDS = {
  banner: __DEV__ ? TestIds.BANNER : (process.env.EXPO_PUBLIC_BANNER_AD_UNIT_ID || TestIds.BANNER),
  native: __DEV__ ? TestIds.NATIVE : (process.env.EXPO_PUBLIC_NATIVE_AD_UNIT_ID || TestIds.NATIVE),
  rewarded: __DEV__ ? TestIds.REWARDED : (process.env.EXPO_PUBLIC_REWARDED_AD_UNIT_ID || TestIds.REWARDED),
  appOpen: __DEV__ ? TestIds.APP_OPEN : (process.env.EXPO_PUBLIC_APP_OPEN_AD_UNIT_ID || TestIds.APP_OPEN),
};

export function getAdUnitId(type: 'banner' | 'native' | 'rewarded' | 'appOpen'): string {
  const resolvedId = AD_UNIT_IDS[type];
  console.log(`Resolved ${type} unit ID (${__DEV__ ? 'DEV/Test' : 'PROD'}):`, resolvedId);
  return resolvedId;
}

