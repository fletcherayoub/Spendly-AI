import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { defaultAIReceiptProvider } from '@/services/aiReceiptProvider';
import { colors } from '@/theme/colors';

export default function PreviewScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!photoUri) return;
    setProcessing(true);

    try {
      const extractedData = await defaultAIReceiptProvider.processReceipt(photoUri);
      router.push({
        pathname: '/scan/review',
        params: {
          photoUri,
          extracted: JSON.stringify(extractedData),
        },
      });
    } catch (e: any) {
      Alert.alert('Processing Failed', 'Could not process receipt image. You can enter expense details manually.', [
        { text: 'Enter Manually', onPress: () => router.push('/expense/create') },
        { text: 'Try Again', style: 'cancel' }
      ]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Receipt</Text>
      </View>

      <View style={styles.imageContainer}>
        {photoUri && <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()} disabled={processing}>
          <Text style={styles.secondaryText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleProcess} disabled={processing}>
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryText}>Process Receipt ✨</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark.textPrimary,
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.dark.card,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  secondaryText: {
    color: colors.dark.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
