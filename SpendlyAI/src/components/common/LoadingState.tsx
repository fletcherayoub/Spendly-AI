import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading Spendly AI...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary[500]} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark.bg,
    padding: 24,
  },
  text: {
    marginTop: 16,
    color: colors.dark.textSecondary,
    fontSize: 16,
  },
});
