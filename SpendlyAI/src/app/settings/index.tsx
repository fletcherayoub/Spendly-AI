import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native';
import { colors } from '@/theme/colors';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Default Currency</Text>
            <Text style={styles.value}>USD ($)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Push Notifications</Text>
            <Switch value={true} trackColor={{ false: '#334155', true: colors.primary[500] }} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch value={true} trackColor={{ false: '#334155', true: colors.primary[500] }} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Privacy & Legal</Text>
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Text style={styles.linkText}>Terms of Service</Text>
        </View>
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
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: colors.dark.textPrimary,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  linkText: {
    color: colors.dark.textSecondary,
    fontSize: 14,
  },
});
