import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../lib/auth';
import './globals.css';


const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QnaIiRpD4BUdbAzF8mdvXHsQYAFsowpsyh6rukKOGVlnBoc7L3HXqVnJvviFoXriuqGAcfXynFbj6nleyWKRpFq00OpvFsvUJ'; 

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <AuthProvider>
          <Stack />
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}