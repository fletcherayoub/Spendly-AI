import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive', 
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        } 
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {(user?.email?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Spendly AI User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Standard Tier</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/goals')}>
            <Text style={styles.menuIcon}>🎯</Text>
            <Text style={styles.menuLabel}>Savings Goals</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/ai/insights')}>
            <Text style={styles.menuIcon}>✨</Text>
            <Text style={styles.menuLabel}>AI Financial Insights</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuLabel}>Settings & Preferences</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    marginTop: 10,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 28,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  badgeText: {
    color: colors.primary[500],
    fontSize: 12,
    fontWeight: '700',
  },
  menuGroup: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.cardBorder,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.dark.textMuted,
  },
  signOutButton: {
    backgroundColor: '#3F1D1D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  signOutText: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 16,
  },
});
