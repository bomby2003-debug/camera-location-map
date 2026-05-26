import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function GalleryScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState([]);

  const loadPhotos = async () => {
    const data = await AsyncStorage.getItem('photos');
    setPhotos(data ? JSON.parse(data) : []);
  };

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  const deletePhoto = async (id) => {
    Alert.alert('Delete Photo', 'ต้องการลบรูปนี้หรือไม่?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const newPhotos = photos.filter((photo) => photo.id !== id);
          setPhotos(newPhotos);
          await AsyncStorage.setItem('photos', JSON.stringify(newPhotos));
        },
      },
    ]);
  };

  const deleteAllPhotos = async () => {
    Alert.alert('Delete All', 'ต้องการลบรูปทั้งหมดหรือไม่?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          setPhotos([]);
          await AsyncStorage.removeItem('photos');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Photo Gallery</Text>

      {photos.length > 0 && (
        <Pressable style={styles.deleteAllButton} onPress={deleteAllPhotos}>
          <Text style={styles.buttonText}>Delete All Photos</Text>
        </Pressable>
      )}

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>ยังไม่มีรูปภาพ</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.uri }} style={styles.image} />

            <Text style={styles.text}>Date: {item.date}</Text>
            <Text style={styles.text}>Place: {item.placeName}</Text>
            <Text style={styles.text}>Latitude: {item.latitude}</Text>
            <Text style={styles.text}>Longitude: {item.longitude}</Text>

            <Pressable
              style={styles.mapButton}
              onPress={() =>
                router.push({
                  pathname: '/map',
                  params: {
                    latitude: item.latitude,
                    longitude: item.longitude,
                    placeName: item.placeName,
                  },
                })
              }
            >
              <Text style={styles.buttonText}>View Map in App</Text>
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={() => deletePhoto(item.id)}
            >
              <Text style={styles.buttonText}>Delete Photo</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 15,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  backText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  deleteAllButton: {
    backgroundColor: '#b91c1c',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 10,
  },
  text: {
    color: 'white',
    marginBottom: 5,
  },
  mapButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
});