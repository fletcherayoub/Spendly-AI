import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { CURRENCIES } from '@/lib/currency';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';

export function CurrencyPicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const t = useSpendlyTheme();
  const [open, setOpen] = useState(false);
  const cur = CURRENCIES.find((c) => c.code === value) ?? CURRENCIES[0];
  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ backgroundColor: t.card, borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: t.ink, fontSize: 16, fontWeight: '700' }}>{cur.symbol} {cur.code} — {cur.label}</Text>
        <Text style={{ color: t.muted }}>▾</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: t.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', padding: 16 }}>
            <Text style={{ color: t.ink, fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Choose currency</Text>
            <ScrollView>
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c.code}
                  onPress={() => { onChange(c.code); setOpen(false); }}
                  style={{ paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border }}>
                  <Text style={{ color: t.ink, fontSize: 15 }}>{c.symbol} {c.code} — {c.label}</Text>
                  {value === c.code ? <Text style={{ color: t.primary, fontWeight: '800' }}>✓</Text> : null}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setOpen(false)} style={{ marginTop: 12, padding: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: t.border }}>
              <Text style={{ color: t.ink, fontWeight: '700' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
