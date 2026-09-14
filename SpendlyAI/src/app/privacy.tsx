import { ScrollView, Text } from 'react-native';
export default function Privacy() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>Privacy Policy</Text>
      <Text>Receipt images and financial data are stored securely per-user (RLS). AI receives only the cropped receipt needed for extraction. AI output is editable and saved only after your confirmation. You can delete your data anytime in Profile → Delete data. Contact: privacy@spendly.ai</Text>
    </ScrollView>
  );
}
