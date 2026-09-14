import { ScrollView, Text } from 'react-native';
export default function Terms() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>Terms of Service</Text>
      <Text>Spendly AI helps track expenses. AI extraction may be imperfect — always review before saving. You retain ownership of your data. Do not use for professional tax/legal advice without verification.</Text>
    </ScrollView>
  );
}
