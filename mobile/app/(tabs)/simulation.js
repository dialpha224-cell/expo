import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

export default function SimulationScreen() {
  const { API_URL } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [loading, setLoading] = useState(false);

  const hairstyles = [
    { id: 'fade', name: 'Degrade', icon: 'cut' },
    { id: 'dreadlocks', name: 'Dreadlocks', icon: 'git-branch' },
    { id: 'braids', name: 'Tresses', icon: 'apps' },
    { id: 'afro', name: 'Afro', icon: 'sunny' },
    { id: 'waves', name: 'Waves', icon: 'water' },
    { id: 'buzz', name: 'Buzz Cut', icon: 'flash' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'acceder a vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setResultImage(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'acceder a la camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setResultImage(null);
    }
  };

  const generateSimulation = async () => {
    if (!selectedImage || !selectedStyle) {
      Alert.alert('Selection requise', 'Choisissez une photo et un style');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ai/simulate-haircut`, {
        image_base64: selectedImage.base64,
        haircut_style: selectedStyle,
      });

      if (response.data.generated_image_url) {
        setResultImage(response.data.generated_image_url);
      } else {
        Alert.alert('Erreur', 'Impossible de generer la simulation');
      }
    } catch (error) {
      console.log('Simulation error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simulation IA</Text>
      <Text style={styles.subtitle}>Visualisez votre nouvelle coupe avant de reserver</Text>

      {/* Image Selection */}
      <View style={styles.imageSection}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
            <TouchableOpacity 
              style={styles.changeImageBtn}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person" size={60} color="#64748b" />
            <Text style={styles.placeholderText}>Ajoutez votre photo</Text>
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Ionicons name="images" size={24} color="#818cf8" />
                <Text style={styles.imageBtnText}>Galerie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#818cf8" />
                <Text style={styles.imageBtnText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Style Selection */}
      <Text style={styles.sectionTitle}>Choisissez un style</Text>
      <View style={styles.stylesGrid}>
        {hairstyles.map((style) => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.styleCard,
              selectedStyle === style.id && styles.styleCardSelected
            ]}
            onPress={() => setSelectedStyle(style.id)}
          >
            <Ionicons 
              name={style.icon} 
              size={28} 
              color={selectedStyle === style.id ? '#fff' : '#818cf8'} 
            />
            <Text style={[
              styles.styleName,
              selectedStyle === style.id && styles.styleNameSelected
            ]}>
              {style.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result */}
      {resultImage && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Resultat</Text>
          <Image source={{ uri: resultImage }} style={styles.resultImage} />
        </View>
      )}

      {/* Generate Button */}
      <TouchableOpacity 
        style={[
          styles.generateBtn,
          (!selectedImage || !selectedStyle) && styles.generateBtnDisabled
        ]}
        onPress={generateSimulation}
        disabled={loading || !selectedImage || !selectedStyle}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="sparkles" size={24} color="#fff" />
            <Text style={styles.generateBtnText}>Generer la simulation</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignSelf: 'center',
  },
  changeImageBtn: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#64748b',
    marginTop: 12,
    marginBottom: 20,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  imageBtn: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  imageBtnText: {
    color: '#818cf8',
    marginTop: 4,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  styleCard: {
    width: '30%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleCardSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8',
  },
  styleName: {
    color: '#94a3b8',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  styleNameSelected: {
    color: '#fff',
  },
  resultSection: {
    marginBottom: 16,
  },
  resultImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: '#1e293b',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 'auto',
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
