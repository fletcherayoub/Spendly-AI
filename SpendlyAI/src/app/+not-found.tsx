import { Redirect } from 'expo-router';

/** Safety net: any unknown route bounces to the Home tab. */
export default function NotFoundScreen() {
  return <Redirect href="/" />;
}
