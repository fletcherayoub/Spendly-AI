import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/common/LoadingState';

export default function RootLayout() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingState message="Initializing Spendly AI..." />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.dark.bg },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="scan/index" />
      <Stack.Screen name="scan/preview" />
      <Stack.Screen name="scan/review" />
      <Stack.Screen name="expense/create" />
      <Stack.Screen name="expense/[id]" />
      <Stack.Screen name="goals/index" />
      <Stack.Screen name="ai/insights" />
      <Stack.Screen name="settings/index" />
    </Stack>
  );
}
