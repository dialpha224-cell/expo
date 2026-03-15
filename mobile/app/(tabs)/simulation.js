import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

const { width } = Dimensions.get('window');

export default function SimulationScreen() {
  const { user, API_URL } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [loading, setLoading] = useState(false);

  const hairstyles = [
    { id: 'fade', name: 'Dégradé', icon: 'cut', description: 'Coupe classique avec dégradé' },
    { id: 'dreadlocks', name: 'Dreadlocks', icon: 'git-branch', description: 'Locks naturels' },
    { id: 'braids', name: 'Tresses', icon: 'apps', description: 'Tresses africaines' },
    { id: 'afro', name: 'Afro', icon: 'sunny', description: 'Afro naturel volumineux' },
    { id: 'waves', name: 'Waves', icon: 'water', description: '360 waves' },
    { id: 'buzz', name: 'Buzz Cut', icon: 'flash', description: 'Coupe courte' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos pour la simulation');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setResultImage(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à la caméra pour la simulation');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
      cameraType: ImagePicker.CameraType.front, // Caméra frontale par défaut
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setResultImage(null);
    }
  };

  const generateSimulation = async () => {
    if (!selectedStyle) {
      Alert.alert('Style requis', 'Veuillez choisir un style de coiffure');
      return;
    }

    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour utiliser la simulation IA');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        haircut_style: selectedStyle,
      };

      // Si une image est sélectionnée, l'envoyer
      if (selectedImage && selectedImage.base64) {
        requestData.image_base64 = selectedImage.base64;
      }

      const response = await axios.post(
        `${API_URL}/ai/simulate-haircut`,
        requestData,
        { withCredentials: true, timeout: 120000 }
      );

      if (response.data.generated_image_url) {
        setResultImage(response.data.generated_image_url);
        Alert.alert('Succès!', 'Votre simulation a été générée');
      } else if (response.data.image_base64) {
        setResultImage(`data:image/png;base64,${response.data.image_base64}`);
        Alert.alert('Succès!', 'Votre simulation a été générée');
      } else {
        Alert.alert('Erreur', 'Aucune image générée');
      }
    } catch (error) {
      console.log('Simulation error:', error.response?.data || error.message);
      Alert.alert('Erreur', error.response?.data?.detail || 'Une erreur est survenue lors de la simulation');
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setSelectedImage(null);
    setResultImage(null);
    setSelectedStyle(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Simulation IA</Text>
        <Text style={styles.subtitle}>
          Visualisez votre nouvelle coupe avant de réserver
        </Text>
      </View>

      {/* Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Votre photo (optionnel)</Text>
        <Text style={styles.sectionHint}>
          Prenez un selfie ou choisissez une photo pour un résultat personnalisé
        </Text>
        
        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close-circle" size={30} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageBtn} onPress={takePhoto}>
              <View style={styles.imageBtnIcon}>
                <Ionicons name="camera" size={32} color="#818cf8" />
              </View>
              <Text style={styles.imageBtnTitle}>Prendre un selfie</Text>
              <Text style={styles.imageBtnHint}>Caméra frontale</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
              <View style={styles.imageBtnIcon}>
                <Ionicons name="images" size={32} color="#818cf8" />
              </View>
              <Text style={styles.imageBtnTitle}>Galerie</Text>
              <Text style={styles.imageBtnHint}>Choisir une photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Style Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Choisissez un style</Text>
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
              {selectedStyle === style.id && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Result Section */}
      {resultImage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résultat</Text>
          <View style={styles.resultContainer}>
            <Image source={{ uri: resultImage }} style={styles.resultImage} />
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.resultActionBtn}>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.resultActionText}>Sauvegarder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resultActionBtn}>
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.resultActionText}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Generate Button */}
      <View style={styles.bottomSection}>
        {resultImage ? (
          <TouchableOpacity style={styles.resetBtn} onPress={resetSimulation}>
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.resetBtnText}>Nouvelle simulation</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.generateBtn,
              !selectedStyle && styles.generateBtnDisabled
            ]}
            onPress={generateSimulation}
            disabled={loading || !selectedStyle}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.generateBtnText}>Génération en cours...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="#fff" />
                <Text style={styles.generateBtnText}>
                  {selectedImage ? 'Transformer ma photo' : 'Générer la simulation'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {!user && (
          <Text style={styles.loginHint}>
            Connectez-vous pour utiliser la simulation IA
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 10,
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
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  imageBtnIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#0f172a',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageBtnTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageBtnHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#0f172a',
    borderRadius: 15,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  styleCard: {
    width: '31%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
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
    fontWeight: '500',
  },
  styleNameSelected: {
    color: '#fff',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  resultImage: {
    width: '100%',
    height: width - 40,
    backgroundColor: '#334155',
  },
  resultActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  resultActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  resultActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 12,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 12,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  loginHint: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
