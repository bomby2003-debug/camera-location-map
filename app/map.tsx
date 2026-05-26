import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MapScreen() {
  const router = useRouter();
  const { latitude, longitude, placeName } = useLocalSearchParams();

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          title="Photo Location"
          description={String(placeName)}
        />
      </MapView>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Photo Location</Text>
        <Text style={styles.infoText}>Place: {placeName}</Text>
        <Text style={styles.infoText}>Latitude: {lat}</Text>
        <Text style={styles.infoText}>Longitude: {lng}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  backText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 3,
  },
});