// app/event/index.tsx  (or Event.tsx)
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatWorkshopDate, getAllWorkshops, Workshop } from '../../lib/workshops';

export default function EventScreen() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const data = await getAllWorkshops();
        setWorkshops(data);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  const renderWorkshop = ({ item }: { item: Workshop }) => (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>
          <Ionicons name="calendar-outline" size={14} /> {formatWorkshopDate(item.date)} – {item.time}
        </Text>
        <Text style={styles.venue}>
          <Ionicons name="location-outline" size={14} /> {item.venue}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Workshops</Text>
      {workshops.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="sad-outline" size={50} color="#aaa" />
          <Text style={{ color: '#777', marginTop: 8 }}>No workshops found</Text>
        </View>
      ) : (
        <FlatList
          data={workshops}
          keyExtractor={(item) => item.$id}
          renderItem={renderWorkshop}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#f59e0b', // orange header
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 1,
    flexDirection: 'row',
  },
  image: {
    width: 120,
    height: 120,
  },
  placeholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111',
  },
  date: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  venue: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
