import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { SignInScreen } from '@/components/sign-in-screen';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth-store';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const colorScheme = useAppColorScheme();
  const status = useAuthStore((s) => s.status);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedSplashOverlay />
        <ActivityIndicator />
      </View>
    );
  }

  // Not connected → branded Google sign-in. Connected → home tab.
  if (status === 'signedOut') {
    return <SignInScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}
