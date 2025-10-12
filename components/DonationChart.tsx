// components/DonationChart.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { databases } from '../lib/appwrite';

const screenWidth = Dimensions.get('window').width;

type Donation = {
  $id: string;
  postId: string;
  amountLKR: number;
  createdAt: string;
};

type DonationChartProps = {
  donations: Donation[];
};

type PostData = {
  typeOfHelp: string;
};

type PieData = {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
};

const DATABASE_ID = '68d797e8002551ac5a86';
const POSTS_TABLE_ID = 'beneficiaryposts';

// Color mapping for different types of help
const TYPE_COLORS: { [key: string]: string } = {
  'Financial Aid': '#007DBD',
  'Medical Support': '#DC2626',
  'Food Assistance': '#16A34A',
  'Educational Support': '#FFB900',
  'Housing Support': '#7C3AED',
  'Other': '#6B7280',
};

export default function DonationChart({ donations }: DonationChartProps) {
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchPostTypes = async () => {
      if (donations.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const typeAmounts: { [key: string]: number } = {};

        // Fetch type of help for each donation
        await Promise.all(
          donations.map(async (donation) => {
            try {
              const post = await databases.getDocument(
                DATABASE_ID,
                POSTS_TABLE_ID,
                donation.postId
              ) as unknown as PostData;

              const typeOfHelp = post.typeOfHelp || 'Other';
              typeAmounts[typeOfHelp] = (typeAmounts[typeOfHelp] || 0) + donation.amountLKR;
            } catch (error) {
              console.error(`Error fetching post ${donation.postId}:`, error);
              typeAmounts['Other'] = (typeAmounts['Other'] || 0) + donation.amountLKR;
            }
          })
        );

        // Calculate total
        const total = Object.values(typeAmounts).reduce((sum, amount) => sum + amount, 0);
        setTotalAmount(total);

        // Convert to pie chart data format
        const chartData: PieData[] = Object.entries(typeAmounts).map(([type, amount]) => ({
          name: type,
          amount: amount,
          color: TYPE_COLORS[type] || TYPE_COLORS['Other'],
          legendFontColor: '#4B5563',
          legendFontSize: 12,
        }));

        // Sort by amount descending
        chartData.sort((a, b) => b.amount - a.amount);

        setPieData(chartData);
      } catch (error) {
        console.error('Error processing donation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostTypes();
  }, [donations]);

  if (donations.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-lg font-bold text-[#007DBD] mb-4">
          Donations by Type
        </Text>
        <View className="items-center py-8">
          <MaterialCommunityIcons name="chart-pie" size={48} color="#E0EEF7" />
          <Text className="text-gray-400 text-center mt-3">
            No donation history yet.{'\n'}Start making a difference today!
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-lg font-bold text-[#007DBD] mb-4">
          Donations by Type
        </Text>
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#007DBD" />
          <Text className="text-gray-500 mt-3">Loading chart...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm">
      <Text className="text-lg font-bold text-[#007DBD] mb-4">
        Donations by Type
      </Text>

      {pieData.length > 0 ? (
        <>
          <PieChart
            data={pieData.map(item => ({
              name: '',
              population: item.amount,
              color: item.color,
              legendFontColor: item.legendFontColor,
              legendFontSize: item.legendFontSize,
            }))}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            hasLegend={false}
            absolute
          />

          {/* Custom Legend with Percentages */}
          <View className="mt-4">
            {pieData.map((item, index) => {
              const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
              return (
                <View key={index} className="flex-row items-center justify-between py-2.5 border-b border-gray-100">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      style={{ backgroundColor: item.color }}
                      className="w-3.5 h-3.5 rounded-full mr-2.5"
                    />
                    <Text className="text-sm font-medium text-gray-700 flex-shrink">
                      {item.name}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-gray-800">
                      Rs. {item.amount.toLocaleString()}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {percentage}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Total Summary */}
          <View className="mt-4 pt-4 border-t-2 border-[#007DBD]">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-gray-800">
                Total Donated
              </Text>
              <Text className="text-xl font-bold text-[#007DBD]">
                Rs. {totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View className="items-center py-8">
          <Text className="text-gray-400 text-center">
            Unable to load donation data
          </Text>
        </View>
      )}
    </View>
  );
} 