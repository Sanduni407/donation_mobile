// components/DonationChart.tsx
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type DonationChartProps = {
  donations: Array<{
    createdAt: string;
    amountLKR: number;
  }>;
};

export default function DonationChart({ donations }: DonationChartProps) {
  // Process donations by month
  const getMonthlyData = () => {
    const monthlyTotals: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    donations.forEach((donation) => {
      const date = new Date(donation.createdAt);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + donation.amountLKR;
    });

    // Get last 6 months
    const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
      const [aMonth, aYear] = a.split(' ');
      const [bMonth, bYear] = b.split(' ');
      return new Date(`20${bYear}-${monthNames.indexOf(aMonth) + 1}`).getTime() - 
             new Date(`20${aYear}-${monthNames.indexOf(bMonth) + 1}`).getTime();
    });

    const last6Months = sortedMonths.slice(-6);
    const labels = last6Months.length > 0 ? last6Months : ['No Data'];
    const data = last6Months.length > 0 
      ? last6Months.map(month => monthlyTotals[month]) 
      : [0];

    return { labels, data };
  };

  const { labels, data } = getMonthlyData();

  if (donations.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-lg font-bold text-[#007DBD] mb-4">
          Donation History
        </Text>
        <View className="items-center py-8">
          <Text className="text-gray-400 text-center">
            No donation history yet.{'\n'}Start making a difference today!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm">
      <Text className="text-lg font-bold text-[#007DBD] mb-4">
        Donation History (Last 6 Months)
      </Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data,
            },
          ],
        }}
        width={screenWidth - 60}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 125, 189, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#007DBD',
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#E5E7EB',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
}