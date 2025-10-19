import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import HelpRequestCard from '../components/HelpRequestCard';
import { useAuth } from '../lib/auth';
import { getBeneficiaryStats, getUserHelpRequests } from '../lib/beneficiary';

const { width } = Dimensions.get('window');

const COLORS = {
  lightBlue: '#E0EEF7',
  darkBlue: '#007DBD',
  accentYellow: '#FFB900',
  white: '#FFFFFF',
  background: '#F5F9FC',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  border: '#D1E0F0',
};

export default function BeneficiaryProfile() {
  const { user, signOut, deleteAccount } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeRequests: 0,
    pendingRequests: 0,
  });

  // Novel Technology Features
  const [aiInsights, setAiInsights] = useState({
    completionRate: 0,
    avgResponseTime: 0,
    successPrediction: 0,
    optimizationTips: [] as string[],
  });
  const [showAiPanel, setShowAiPanel] = useState(false);
  const aiPanelAnimation = useState(new Animated.Value(0))[0];
  const [progressAnimation] = useState(new Animated.Value(0));

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docs = await getUserHelpRequests(user.$id);
      setRequests(docs);
      generateAIInsights(docs);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch your requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      const beneficiaryStats = await getBeneficiaryStats(user.$id);
      setStats({
        totalDonations: beneficiaryStats.totalDonations,
        activeRequests: beneficiaryStats.activeRequests,
        pendingRequests: beneficiaryStats.pendingRequests,
      });
      
      // Animate progress
      Animated.timing(progressAnimation, {
        toValue: beneficiaryStats.totalDonations,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    } catch (err) {
      console.error(err);
    }
  };

  // AI-Powered Insights Generator
  const generateAIInsights = (userRequests: any[]) => {
    if (userRequests.length === 0) {
      setAiInsights({
        completionRate: 0,
        avgResponseTime: 0,
        successPrediction: 0,
        optimizationTips: ['Create your first request to get AI-powered insights!'],
      });
      return;
    }

    // Calculate completion rate
    const approved = userRequests.filter(r => r.status === 'Approved').length;
    const completionRate = (approved / userRequests.length) * 100;

    // Calculate average response time (mock - in real app, use actual timestamps)
    const avgResponseTime = Math.floor(Math.random() * 5) + 2; // 2-7 days

    // AI Success Prediction based on historical data
    let successPrediction = 50;
    if (completionRate > 70) successPrediction = 85;
    else if (completionRate > 50) successPrediction = 70;
    else if (completionRate > 30) successPrediction = 60;

    // Generate optimization tips using AI logic
    const tips: string[] = [];
    
    if (completionRate < 50) {
      tips.push('📝 Add more detailed descriptions to increase approval chances');
    }
    
    const hasEvidence = userRequests.some(r => r.evidenceFileIds);
    if (!hasEvidence) {
      tips.push('📎 Upload supporting documents to build trust with donors');
    }

    const urgentCount = userRequests.filter(r => r.urgency === 'Urgent').length;
    if (urgentCount > userRequests.length * 0.7) {
      tips.push('⏰ Consider varying urgency levels - not all requests need to be urgent');
    }

    const avgAmount = userRequests.reduce((sum, r) => sum + (r.requestedAmount || 0), 0) / userRequests.length;
    if (avgAmount > 500000) {
      tips.push('💰 Breaking large requests into smaller milestones may increase success rate');
    }

    if (tips.length === 0) {
      tips.push('✅ Your requests look great! Keep up the good work');
      tips.push('🎯 Best time to post: Early morning or evening for better visibility');
    }

    setAiInsights({
      completionRate,
      avgResponseTime,
      successPrediction,
      optimizationTips: tips,
    });
  };

  const toggleAiPanel = () => {
    const toValue = showAiPanel ? 0 : 1;
    setShowAiPanel(!showAiPanel);
    
    Animated.spring(aiPanelAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
      fetchStats();
    }, [user])
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAccount() },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => signOut(), style: 'destructive' },
      ]
    );
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>No user logged in.</Text>
      </View>
    );
  }

  const aiPanelTranslateY = aiPanelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const aiPanelOpacity = aiPanelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Enhanced Header */}
      <View style={{ 
        backgroundColor: COLORS.darkBlue, 
        paddingHorizontal: 20, 
        paddingVertical: 20, 
        paddingTop: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}>
        {/* Profile Section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: COLORS.white,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 5,
                borderWidth: 3,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              {user?.prefs?.avatar ? (
                <Image
                  source={{ uri: user.prefs.avatar }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                />
              ) : (
                <Ionicons name="person" size={28} color={COLORS.darkBlue} />
              )}
            </TouchableOpacity>

            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 2 }}>
                Welcome back! 👋
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.white }} numberOfLines={1}>
                {user.name || 'Beneficiary'}
              </Text>
            </View>
          </View>

          {/* AI Assistant Button */}
          <TouchableOpacity
            onPress={toggleAiPanel}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="sparkles" size={24} color={COLORS.accentYellow} />
          </TouchableOpacity>
        </View>

        {/* Dashboard Title */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 }}>
            My Dashboard
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Statistics Section with Animation */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }}>
            Your Stats
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                padding: 16,
                borderRadius: 14,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="wallet-outline" size={24} color={COLORS.success} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Donations
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                LKR {stats.totalDonations.toFixed(0)}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                padding: 16,
                borderRadius: 14,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Active
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                {stats.activeRequests}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                padding: 16,
                borderRadius: 14,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="time-outline" size={24} color={COLORS.accentYellow} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Pending
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                {stats.pendingRequests}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Success Predictor Card */}
        <View style={{
          backgroundColor: COLORS.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
          borderLeftWidth: 4,
          borderLeftColor: COLORS.accentYellow,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="analytics" size={24} color={COLORS.accentYellow} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 10 }}>
              AI Success Predictor
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flex: 1, height: 8, backgroundColor: COLORS.lightBlue, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ 
                width: `${aiInsights.successPrediction}%`, 
                height: '100%', 
                backgroundColor: aiInsights.successPrediction > 70 ? COLORS.success : COLORS.accentYellow,
                borderRadius: 4,
              }} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.darkBlue, marginLeft: 12 }}>
              {aiInsights.successPrediction}%
            </Text>
          </View>
          
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
            Predicted success rate for your next request based on historical data
          </Text>
        </View>

        {/* My Requests Section */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.darkBlue }}>My Requests</Text>
            <View style={{ height: 3, width: 40, backgroundColor: COLORS.accentYellow, borderRadius: 2 }} />
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.darkBlue} />
              <Text style={{ marginTop: 12, fontSize: 14, color: COLORS.textSecondary }}>Loading requests...</Text>
            </View>
          ) : requests.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="document-outline" size={48} color={COLORS.lightBlue} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 12 }}>
                No ongoing requests
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' }}>
                Create your first request to get started
              </Text>
            </View>
          ) : (
            <View>
              {requests.map((request) => (
                <HelpRequestCard
                  key={request.$id}
                  request={request}
                  onDeleted={fetchRequests}
                  onEdited={fetchRequests}
                />
              ))}
            </View>
          )}
        </View>

        {/* Submit Request Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 14,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            borderTopWidth: 3,
            borderTopColor: COLORS.success,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#D1FAE5',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.success} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.darkBlue }}>
                Need Help?
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                Submit a new help request
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/beneficiary/HelpRequestFormScreen')}
            style={{
              flexDirection: 'row',
              backgroundColor: COLORS.success,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 15, marginLeft: 6 }}>
              Submit Request
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 14,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Card Header */}
          <View
            style={{
              backgroundColor: COLORS.lightBlue,
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="settings-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 10 }}>
                Account Settings
              </Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={{ padding: 16, gap: 12 }}>
            {/* User Info */}
            <View
              style={{
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 }}>
                USER INFORMATION
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 }}>
                {user.name || 'User'}
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                {user.email || 'No email'}
              </Text>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: 'row',
                backgroundColor: '#FEF3C7',
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.accentYellow} />
              <Text style={{ color: COLORS.accentYellow, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                Logout
              </Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={{
                flexDirection: 'row',
                backgroundColor: '#FEE2E2',
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={{ color: COLORS.error, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* AI Insights Panel - Slides from bottom */}
      {showAiPanel && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
            transform: [{ translateY: aiPanelTranslateY }],
            opacity: aiPanelOpacity,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sparkles" size={24} color={COLORS.accentYellow} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.darkBlue, marginLeft: 10 }}>
                AI Insights
              </Text>
            </View>
            <TouchableOpacity onPress={toggleAiPanel}>
              <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Performance Metrics */}
          <View style={{ flexDirection: 'row', marginBottom: 20, gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: COLORS.lightBlue, padding: 12, borderRadius: 12 }}>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 }}>Completion Rate</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.darkBlue }}>
                {aiInsights.completionRate.toFixed(0)}%
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: COLORS.lightBlue, padding: 12, borderRadius: 12 }}>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 }}>Avg Response</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.darkBlue }}>
                {aiInsights.avgResponseTime}d
              </Text>
            </View>
          </View>

          {/* Optimization Tips */}
          <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.darkBlue, marginBottom: 12 }}>
            💡 Optimization Tips
          </Text>
          {aiInsights.optimizationTips.map((tip, index) => (
            <View key={index} style={{ 
              flexDirection: 'row', 
              backgroundColor: COLORS.background, 
              padding: 12, 
              borderRadius: 10,
              marginBottom: 8,
            }}>
              <Text style={{ fontSize: 13, color: COLORS.textPrimary, flex: 1 }}>{tip}</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}