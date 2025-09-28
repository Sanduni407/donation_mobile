// app/(tabs)/profile.tsx
import React from 'react';
import { View } from 'react-native';




import AdminProfile from '@/components/AdminProfile';
import BeneficiaryProfile from '@/components/BeneficiaryProfile';
import DonorProfile from '@/components/DonorProfile';
import VolunteerProfile from '@/components/VolunteerProfile';
import { useAuth } from '../../lib/auth';

export default function Profile() {
  const { user } = useAuth();
  const role = user?.prefs?.role ?? 'donor';

  return (
    <View className="flex-1 bg-white p-4">
      {role === 'donor' && <DonorProfile />}
      {role === 'beneficiary' && <BeneficiaryProfile/>}
      {role === 'volunteer' && <VolunteerProfile  />}
      {role === 'admin' && <AdminProfile  />}
    </View>
  );
}
