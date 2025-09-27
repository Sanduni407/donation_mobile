import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../lib/auth';
import './globals.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
