// lib/auth.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { account, AppwriteID, functions } from './appwrite';

type User = any; // keep simple for now

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboardedState] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // check onboarding flag
        const onboard = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboardedState(onboard === 'true');

        // try to get current account
        try {
          const acc = await account.get(); // returns user if session exists
          setUser(acc);
        } catch (err) {
          setUser(null);
        }
      } catch (e) {
        console.warn('Auth init error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setHasOnboarded = async (value: boolean) => {
    await AsyncStorage.setItem('hasOnboarded', value ? 'true' : 'false');
    setHasOnboardedState(value);
  };

  const signUp = async (fullName: string, email: string, password: string, role: string) => {
    setLoading(true);
    try {
      // create account (use Appwrite ID helper)
      await account.create(AppwriteID.unique(), email, password, fullName);

      // create a session (some SDK versions use createEmailPasswordSession)
      try {
        // try new method
        // @ts-ignore
        await account.createEmailPasswordSession({ email, password });
      } catch (e) {
        // fallback to older method (some versions use createEmailSession)
        try {
          // @ts-ignore
          await account.createEmailSession(email, password);
        } catch (e2) {
          throw e2;
        }
      }

      // update name (optional) and store role into prefs
      try {
        await account.updateName(fullName);
        await account.updatePrefs({ role });
      } catch (e) {
        console.warn('Could not update prefs/name (not fatal)', e);
      }

      // fetch user
      const acc = await account.get();
      setUser(acc);
      return acc;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // try modern method, fallback if necessary
      try {
        // @ts-ignore
        await account.createEmailPasswordSession({ email, password });
      } catch (e) {
        // fallback
        // @ts-ignore
        await account.createEmailSession(email, password);
      }
      const acc = await account.get();
      setUser(acc);
      return acc;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // delete current session on this device
      // Appwrite supports 'current' as session id
      await account.deleteSession('current');
    } catch (e) {
      console.warn('Sign out error (continue locally):', e);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem('auth'); // if you stored anything else
      setLoading(false);
      // redirect to sign-in
      try {
        router.replace('/sign-in' as any);
      } catch {}
    }
  };



 const deleteAccount = async () => {
  if (!user) return;

  setLoading(true);
  try {
    // Delete user from server
    const response = await functions.createExecution(
      '68d4d7b500196f351928',
      JSON.stringify({ userId: user.$id })
    );

    if (response.responseStatusCode === 200) {
      console.log('User deleted successfully');
    } else {
      throw new Error(`Function execution failed with status: ${response.responseStatusCode}`);
    }
  } catch (error) {
    console.error('Error deleting user via function:', error);
    Alert.alert('Error', 'Failed to delete account. Please try again.');
    return;
  } finally {
    setLoading(false);
  }

  // Only do local cleanup - don't try to sign out from server
  try {
    setUser(null);
    await AsyncStorage.removeItem('auth');
    await AsyncStorage.removeItem('hasOnboarded');
    router.replace('/sign-in' as any);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

 

  return (
    <AuthContext.Provider value={{ user, loading, hasOnboarded, setHasOnboarded, signUp, signIn, signOut ,deleteAccount}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
