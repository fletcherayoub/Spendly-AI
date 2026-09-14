import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useAuthStore } from '@/store/auth-store';
import { useExpenses } from '@/hooks/use-expenses';
import { askAI, buildSummary } from '@/lib/ai';

interface Msg { role: 'user' | 'ai'; text: string }

export default function AIScreen() {
  const t = useSpendlyTheme();
  const s = createStyles(t);
  const user = useAuthStore((x) => x.user);
  const { data: expenses = [] } = useExpenses(user?.id);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'ai', text: 'Hi! Ask me about your spending — e.g. "Where did my money go this month?"' }]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    const question = q.trim();
    if (!question || busy) return;
    setQ('');
    setMsgs((m) => [...m, { role: 'user', text: question }]);
    setBusy(true);
    try {
      const now = new Date();
      const month = now.toISOString().slice(0, 7);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
      const summary = buildSummary(expenses, month, prev);
      const answer = await askAI(question, summary);
      setMsgs((m) => [...m, { role: 'ai', text: answer }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: 'ai', text: e instanceof Error ? e.message : 'AI failed' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.root}><SafeAreaView style={s.safe}>
      <Text style={s.title}>Ask AI</Text>
      <ScrollView contentContainerStyle={s.list}>
        {msgs.map((m, i) => (
          <View key={i} style={[s.bubble, m.role === 'user' ? s.user : s.aiB]}>
            <Text style={m.role === 'user' ? s.userT : s.aiT}>{m.text}</Text>
          </View>
        ))}
        {busy ? <ActivityIndicator /> : null}
      </ScrollView>
      <View style={s.row}>
        <TextInput value={q} onChangeText={setQ} placeholder="Ask about spending…" placeholderTextColor={t.muted} style={s.input} onSubmitEditing={send} returnKeyType="send" />
        <Pressable style={s.send} onPress={send} disabled={busy || !q.trim()}>
          <Text style={s.sendT}>Send</Text>
        </Pressable>
      </View>
      <Text style={s.priv}>AI sees only monthly totals per category — never receipt photos.</Text>
    </SafeAreaView></View>
  );
}
const createStyles = (t: SpendlyTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background, flexDirection: 'row', justifyContent: 'center' },
  safe: { flex: 1, maxWidth: MaxContentWidth, padding: Spacing.four, gap: Spacing.three },
  title: { color: t.ink, fontSize: 24, fontWeight: '800' },
  list: { gap: 10, paddingBottom: 10 },
  bubble: { borderRadius: 14, padding: 12, maxWidth: '90%' },
  user: { backgroundColor: t.primary, alignSelf: 'flex-end' },
  aiB: { backgroundColor: t.card, alignSelf: 'flex-start' },
  userT: { color: '#fff', fontSize: 14, lineHeight: 20 },
  aiT: { color: t.ink, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: t.card, color: t.ink, borderRadius: 12, padding: 12 },
  send: { backgroundColor: t.primary, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  sendT: { color: '#fff', fontWeight: '800' },
  priv: { color: t.muted, fontSize: 11, textAlign: 'center' },
});
