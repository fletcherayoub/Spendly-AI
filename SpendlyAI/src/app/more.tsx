import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, Spendly } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useAuthStore } from '@/store/auth-store';

export default function MoreScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const actionInFlight = useAuthStore((s) => s.actionInFlight);
  const { data: profile } = useProfile(user?.id);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.card}>
          <Text style={styles.name}>{profile?.display_name ?? 'Spendly user'}</Text>
          <Text style={styles.email}>{profile?.email ?? user?.email ?? ''}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          onPress={signOut}
          disabled={actionInFlight}>
          {actionInFlight ? (
            <ActivityIndicator color={Spendly.danger} />
          ) : (
            <Text style={styles.signOutText}>Log out</Text>
          )}
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Spendly.background,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safe: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    color: Spendly.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    backgroundColor: Spendly.card,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  name: {
    color: Spendly.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  email: {
    color: Spendly.muted,
    fontSize: 14,
  },
  signOut: {
    borderWidth: 1,
    borderColor: '#E4CFC9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: Spendly.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
