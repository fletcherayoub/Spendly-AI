import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useAddExpense } from '@/hooks/use-expenses';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { CATEGORIES } from '@/lib/categories';
import { CURRENCIES, formatMoney } from '@/lib/currency';
import { logger } from '@/lib/logger';
import { uploadReceipt } from '@/lib/receipts';
import { validAmount, validCurrency, validDate } from '@/lib/validation';
import { scanReceiptBase64, type ScanResult } from '@/lib/scan';
import { useAuthStore } from '@/store/auth-store';
import type { ExpenseCategory } from '@/types/expense';

const log = logger.scope('ScanScreen');

export default function ScanScreen() {
  const t = useSpendlyTheme();
  const s = createStyles(t);
  const user = useAuthStore((x) => x.user);
  const addExpenseMutation = useAddExpense();

  const [perm, requestPerm] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Review Modal State
  const [reviewResult, setReviewResult] = useState<ScanResult | null>(null);
  const [lastBase64, setLastBase64] = useState<string | null>(null);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('groceries');
  const [note, setNote] = useState('');

  function openReview(result: ScanResult) {
    setReviewResult(result);
    setMerchant(result.merchant ?? '');
    setAmount(result.total != null ? String(result.total) : '');
    setCurrency(result.currency ?? 'EUR');
    setDate(result.date ?? new Date().toISOString().slice(0, 10));
    setCategory((result.category ?? 'groceries') as ExpenseCategory);
    setNote('');
  }

  async function handleBase64(base64: string | undefined) {
    if (!base64) {
      log.warn('No base64 image data available');
      setErr('Could not read image data. Please try again.');
      return;
    }
    if (base64.length > 7_000_000) { setErr('Image too large. Pick a smaller photo.'); return; }
    setLastBase64(base64);
    setBusy(true);
    setErr(null);
    try {
      log.info('Processing receipt image with AI...');
      const result = await scanReceiptBase64(base64);
      log.info('Scan complete! Opening review screen modal', result);
      openReview(result);
    } catch (e) {
      log.error('AI Scan Error', e);
      setErr(e instanceof Error ? e.message : 'AI scan failed');
    } finally {
      setBusy(false);
    }
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    try {
      setBusy(true);
      log.info('Taking photo with camera...');
      const pic = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      if (pic?.base64) {
        await handleBase64(pic.base64);
      } else {
        log.warn('Camera photo took but base64 was missing');
        setErr('Failed to capture photo data.');
      }
    } catch (e) {
      log.error('Camera capture error', e);
      setErr('Failed to take photo with camera.');
    } finally {
      setBusy(false);
    }
  }

  async function pickFromGallery() {
    try {
      log.info('Launching gallery picker...');
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.8,
      });

      if (!res.canceled && res.assets?.[0]) {
        log.info('Selected photo from gallery');
        await handleBase64(res.assets[0].base64 ?? undefined);
      }
    } catch (e) {
      log.error('Gallery pick error', e);
      setErr('Failed to select image from gallery.');
    }
  }

  async function confirmSave() {
    if (!user || !amount) return;
    const amt = validAmount(amount);
    if (amt == null) { setErr('Enter a valid amount greater than 0.'); return; }
    if (!validCurrency(currency)) { setErr('Currency must be one of: ' + CURRENCIES.join(', ')); return; }
    const cleanDate = date || new Date().toISOString().slice(0, 10);
    if (!validDate(cleanDate)) { setErr('Date must be YYYY-MM-DD.'); return; }
    try {
      let receiptPath: string | null = null;
      if (lastBase64 && user) {
        try { receiptPath = await uploadReceipt(user.id, lastBase64); }
        catch (e) { log.warn('Receipt upload failed, saving without image', e); }
      }
      await addExpenseMutation.mutateAsync({
        user_id: user.id,
        merchant: merchant.trim() || null,
        amount: amt,
        currency: currency.toUpperCase(),
        category,
        date: cleanDate,
        note: note.trim() || null,
        receipt_url: receiptPath,
        items: reviewResult?.items ?? null,
        tax: reviewResult?.tax ?? null,
        ai_confidence: reviewResult?.confidence ?? null,
      });

      setReviewResult(null);
      log.info('Expense saved! Navigating to Expenses screen');
      router.push('/expenses' as never);
    } catch (e) {
      log.error('Failed to save expense', e);
    }
  }

  if (!perm?.granted) {
    return (
      <View style={s.root}>
        <SafeAreaView style={s.safe}>
          <Text style={s.title}>Scan Receipt</Text>
          <Text style={s.hint}>We need camera access to scan receipts directly. Gallery upload works as well.</Text>
          <Pressable style={s.cta} onPress={requestPerm}>
            <Text style={s.ctaText}>Allow Camera Access</Text>
          </Pressable>
          <Pressable style={s.ghost} onPress={pickFromGallery}>
            <Text style={s.ghostText}>Pick photo from gallery</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <Text style={s.title}>Scan Receipt</Text>
        <CameraView ref={cameraRef} style={s.cam} facing="back" />
        <Text style={s.hint}>
          Position the receipt in frame and tap "Capture & Analyze", or upload a photo from your gallery.
        </Text>
        {err ? <Text style={s.err}>{err}</Text> : null}

        {busy ? (
          <ActivityIndicator size="large" color={t.primary} style={{ marginVertical: 15 }} />
        ) : (
          <View style={{ gap: 10 }}>
            <Pressable style={s.cta} onPress={takePhoto}>
              <Text style={s.ctaText}>📸 Capture & Analyze</Text>
            </Pressable>
            <Pressable style={s.ghost} onPress={pickFromGallery}>
              <Text style={s.ghostText}>🖼️ Upload photo from gallery</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      {/* REVIEW & CONFIRM MODAL */}
      <Modal visible={!!reviewResult} animationType="slide" transparent>
        <View style={s.modalBackdrop}>
          <View style={s.modalContent}>
            <ScrollView contentContainerStyle={{ gap: 12 }}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Review AI Scan</Text>
                <Text style={s.modalHint}>Check & edit receipt details before saving.</Text>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.label}>Merchant / Store Name</Text>
                <TextInput
                  value={merchant}
                  onChangeText={setMerchant}
                  style={s.input}
                  placeholder="e.g. Lidl Supermarket"
                  placeholderTextColor={t.muted}
                />
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.label}>Amount ({currency})</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  style={s.input}
                  placeholder="0.00"
                  placeholderTextColor={t.muted}
                />
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.label}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  style={s.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={t.muted}
                />
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.label}>Category</Text>
                <View style={s.chips}>
                  {CATEGORIES.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategory(c.id)}
                      style={[s.chip, category === c.id && s.chipOn]}>
                      <Text style={category === c.id ? s.chipOnT : s.chipT}>
                        {c.emoji} {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.label}>Note (Optional)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  style={s.input}
                  placeholder="Add note..."
                  placeholderTextColor={t.muted}
                />
              </View>

              {/* Scanned items preview */}
              {reviewResult?.items && reviewResult.items.length > 0 && (
                <View style={s.itemsPreview}>
                  <Text style={s.itemsTitle}>Scanned Items Breakdown</Text>
                  {reviewResult.items.map((it, idx) => (
                    <View key={idx} style={s.itemRow}>
                      <Text style={s.itemName}>{it.qty ? `${it.qty}x ` : ''}{it.name}</Text>
                      {it.price != null && <Text style={s.itemPrice}>{formatMoney(it.price, currency)}</Text>}
                    </View>
                  ))}
                </View>
              )}

              <View style={s.modalActions}>
                <Pressable style={s.cancelBtn} onPress={() => setReviewResult(null)}>
                  <Text style={s.cancelBtnText}>Discard</Text>
                </Pressable>
                <Pressable
                  style={s.saveBtn}
                  onPress={confirmSave}
                  disabled={addExpenseMutation.isPending}>
                  <Text style={s.saveBtnText}>
                    {addExpenseMutation.isPending ? 'Saving…' : 'Confirm & Save'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (t: SpendlyTheme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background, flexDirection: 'row', justifyContent: 'center' },
    safe: { flex: 1, maxWidth: MaxContentWidth, padding: Spacing.four, gap: Spacing.three },
    title: { color: t.ink, fontSize: 26, fontWeight: '800' },
    hint: { color: t.muted, fontSize: 13, lineHeight: 18 },
    err: { color: t.danger, fontSize: 13, fontWeight: '600' },
    cam: { height: 260, borderRadius: 16, overflow: 'hidden' },
    cta: { backgroundColor: t.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
    ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    ghost: { borderWidth: 1, borderColor: t.border, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
    ghostText: { color: t.ink, fontWeight: '700', fontSize: 15 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: {
      backgroundColor: t.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: Spacing.four,
      maxHeight: '85%',
    },
    modalHeader: { marginBottom: 6 },
    modalTitle: { color: t.ink, fontSize: 22, fontWeight: '800' },
    modalHint: { color: t.muted, fontSize: 13 },
    fieldGroup: { gap: 6 },
    label: { color: t.muted, fontSize: 13, fontWeight: '700' },
    input: { backgroundColor: t.card, color: t.ink, borderRadius: 12, padding: 12, fontSize: 16 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { borderWidth: 1, borderColor: t.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    chipOn: { backgroundColor: t.primary, borderColor: t.primary },
    chipT: { color: t.ink, fontSize: 13 },
    chipOnT: { color: '#fff', fontSize: 13, fontWeight: '700' },
    itemsPreview: { backgroundColor: t.card, borderRadius: 14, padding: 12, gap: 6 },
    itemsTitle: { color: t.ink, fontWeight: '700', fontSize: 14 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
    itemName: { color: t.ink, fontSize: 13 },
    itemPrice: { color: t.ink, fontWeight: '700', fontSize: 13 },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    cancelBtn: { flex: 1, borderWidth: 1, borderColor: t.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    cancelBtnText: { color: t.ink, fontWeight: '700', fontSize: 15 },
    saveBtn: { flex: 1, backgroundColor: t.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  });
