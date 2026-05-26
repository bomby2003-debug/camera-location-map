import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [facing, setFacing] = useState('back');
  const [lastPhoto, setLastPhoto] = useState(null);

  const takePicture = async () => {
    if (!cameraRef.current || saving) return;

    try {
      setSaving(true);

      const photo = await cameraRef.current.takePictureAsync();

      await MediaLibrary.requestPermissionsAsync();
      await MediaLibrary.saveToLibraryAsync(photo.uri);

      const locationPermission =
        await Location.requestForegroundPermissionsAsync();

      if (locationPermission.status !== 'granted') {
        Alert.alert('Permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      let placeName = 'Unknown location';

      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address.length > 0) {
          const place = address[0];

          placeName = `${place.city || place.district || ''} ${
            place.region || ''
          }`;
        }
      } catch (error) {
        placeName = 'Unknown location';
      }

      const photoData = {
        id: Date.now(),
        uri: photo.uri,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        date: new Date().toLocaleString(),
        placeName,
      };

      const existingPhotos = await AsyncStorage.getItem('photos');
      const photos = existingPhotos ? JSON.parse(existingPhotos) : [];

      photos.push(photoData);

      await AsyncStorage.setItem('photos', JSON.stringify(photos));

      setLastPhoto(photo.uri);

      Alert.alert(
        'Success',
        `Photo saved!\n\nLocation: ${placeName}\nLatitude: ${photoData.latitude}\nLongitude: ${photoData.longitude}`
      );
    } catch (error) {
      Alert.alert('Error', 'Cannot save photo');
    } finally {
      setSaving(false);
    }
  };

  const flipCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>

        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.cameraTitle}>Camera</Text>

        <View style={styles.topRightSpace} />
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.previewButton}
          onPress={() => router.push('/gallery')}
        >
          {lastPhoto ? (
            <Image source={{ uri: lastPhoto }} style={styles.previewImage} />
          ) : (
            <View style={styles.emptyPreview}>
              <Text style={styles.emptyPreviewText}>🖼️</Text>
            </View>
          )}
        </Pressable>

        <Pressable style={styles.captureButton} onPress={takePicture}>
          <View style={styles.innerCapture} />
        </Pressable>

        <Pressable style={styles.flipButton} onPress={flipCamera}>
          <Text style={styles.flipText}>↻</Text>
        </Pressable>
      </View>

      {saving && (
        <View style={styles.savingBox}>
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  camera: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  permissionButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  permissionText: {
    color: 'white',
    fontWeight: 'bold',
  },

  topBar: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  backText: {
    color: 'white',
    fontWeight: 'bold',
  },

  cameraTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  topRightSpace: {
    width: 75,
  },

  zoomContainer: {
    position: 'absolute',
    bottom: 155,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  zoomText: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 12,
  },

  zoomActive: {
    color: '#facc15',
    fontSize: 17,
    fontWeight: 'bold',
    marginHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.9)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  previewButton: {
    width: 65,
    height: 65,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  emptyPreview: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyPreviewText: {
    fontSize: 28,
  },

  captureButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'transparent',
    borderWidth: 6,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerCapture: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'white',
  },

  flipButton: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  flipText: {
    color: 'white',
    fontSize: 38,
    fontWeight: 'bold',
  },

  savingBox: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  savingText: {
    color: 'white',
    fontWeight: 'bold',
  },
});