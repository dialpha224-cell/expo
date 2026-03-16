import { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  FlatList
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
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [rotationAngle, setRotationAngle] = useState(0);
  const carouselRef = useRef(null);

  const rotationLabels = {
    0: "Face",
    1: "Profil Droit",
    2: "Dos",
    3: "Profil Gauche",
    4: "Dessus"
  };

  // 30+ styles de coiffure avec images AI
  const hairstyles = [
    { id: 'taper-beard', name: 'Taper Fade + Barbe', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/5a74bd03d51115436d28479c2be767eaf3a6ecf2eebdc673c11baea9501e31f9.png' },
    { id: 'waves-beard', name: '360 Waves + Barbe', category: 'Waves', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/43162635dc0d00a032ccda23f09c1c00a668c10147ce7e6c81257d9eec8794f2.png' },
    { id: 'hightop-goatee', name: 'High Top + Bouc', category: 'Afro', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/40b52420728e44958ec43d1b43c6ebf627fc4f62d851326ce2ea13f5cfa65142.png' },
    { id: 'lowfade-stubble', name: 'Low Fade + Barbe Courte', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2f6f5d11cb075a185e06d5743a8eb1999dff8876d3eedebf66986f45a5ee0c1.png' },
    { id: 'afro-beard', name: 'Afro Naturelle + Barbe', category: 'Afro', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/f7191e3c2abff0ea8910c590ea46a5526f72a83c50bce88d8b26e2198f7bb711.png' },
    { id: 'buzz-beard', name: 'Buzz Cut + Barbe', category: 'Courts', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/44d43007533a0f29551419ff5e7dcb0286bb49094bebd58a0b2009d05bc71c46.png' },
    { id: 'skinfade-designer', name: 'Skin Fade + Design', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1cc5a0d53b27b2dccd59175fa06c52b6a17bec24b892989b5f4ca0b4a75adf06.png' },
    { id: 'cornrows-beard', name: 'Cornrows + Barbe', category: 'Tresses', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/bdb3eac0e84fbe1461b2c24dfce96ad900165677102caf19a4687da360ecccd2.png' },
    { id: 'fulani-beard', name: 'Tresses Fulani + Barbe', category: 'Tresses', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/2368e2dec7ce77152ed9d3f7340f46b92f6adb7cf7e8f2402de3de8b88e53583.png' },
    { id: 'shortdreads-beard', name: 'Dreads Courts + Barbe', category: 'Locks', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b8413b9853ad7a25153d000160a63fe913900717d137f217c971e09706df05c5.png' },
    { id: 'longdreads-beard', name: 'Dreads Longs + Barbe', category: 'Locks', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/83d2b5f2e66feb00f42f3da42d59370c5b3dd52afc5673c6614edfa81a967f65.png' },
    { id: 'boxbraids-beard', name: 'Box Braids + Barbe', category: 'Tresses', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ab542ae1dc216b005dc3d4129e920c5a64e802ec1b5ce3072417513c9e64a844.png' },
    { id: 'twists-beard', name: 'Two Strand Twists', category: 'Naturel', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ea04d4455635e9a34c3d458ec2f3dcc6d6a63cd05c694f09965be4a90c825758.png' },
    { id: 'templefade-curly', name: 'Temple Fade + Curly', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/df2794ebe0d795d4053f8a6260b7051d9feb4d49f24aa9195a43c6b1d2f245dc.png' },
    { id: 'mohawk-beard', name: 'Mohawk Fade + Barbe', category: 'Créatifs', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/72803f33fd1066f9034aec361385b429e29f83d94c89a76334e0a5be3fb8ddf5.png' },
    { id: 'frohawk-goatee', name: 'Frohawk + Bouc', category: 'Créatifs', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/289bb0be7e22cf6acb555643eede436b0270e22c59e4cbfe03aa6de559ea3b5f.png' },
    { id: 'dropfade-beard', name: 'Drop Fade + Barbe', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/51a0fd6b16b029dc9e0f74fd5ca1e1803cc1e283e6da74013ea6422556d356aa.png' },
    { id: 'burstfade-beard', name: 'Burst Fade + Barbe', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/45d97352c35d9d92b46fe8755375b45b5e49aca3da1bd42e313319e91f3ad554.png' },
    { id: 'flattop-beard', name: 'Flat Top + Barbe', category: 'Afro', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/973777cd63edf86e0b12f75c56145f6a9224582ecb6a00d1bc3a493b46c5f4c5.png' },
    { id: 'bald-fullbeard', name: 'Crâne Rasé + Barbe', category: 'Courts', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/6c5cde2836906732a1c431c826b5070ea52279f9c734979ec5e4558c6017d6b7.png' },
    { id: 'sidepart-beard', name: 'Raie sur le Côté', category: 'Classiques', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/a430e13090c40f0bc64e1d05a1fbaebb9c67827b5e296b3c9799d58f1f2169e1.png' },
    { id: 'combover-beard', name: 'Comb Over + Barbe', category: 'Classiques', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/20af7735ebeb3253f02d6f197e26ae05e8f2bb8bb9a8d81f48975fa9c0d2aad4.png' },
    { id: 'edgar-beard', name: 'Edgar Cut + Barbe', category: 'Tendance', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ba8aa82c90b19714624ca5adc0ca003f37ef746be37acef21ac46157e07c467e.png' },
    { id: 'texturedcrop-beard', name: 'Texture Crop + Barbe', category: 'Tendance', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/d9bc229084a7d1bcdb5c85d921e50a0db42c5077cb1a0b02284a91e2f20e87a9.png' },
    { id: 'midfade-curls', name: 'Mid Fade + Boucles', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/3eb45be6976c1ab3463e48bc3dcbc9cf6461bb331014491e2783662e7c532de0.png' },
    { id: 'twistout-beard', name: 'Twist Out + Barbe', category: 'Naturel', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/0dcaa98a76adde5f5a2a2d93bd2965634d0ba4e962fc7f1e41e788e64d3493e6.png' },
    { id: 'fingercoils-beard', name: 'Finger Coils + Barbe', category: 'Naturel', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ec8ec68c45eb05545778c343a7f013edf52fff36f3361046b14f637f08e5b10a.png' },
    { id: 'tapernatural-beard', name: 'Taper Naturel + Barbe', category: 'Naturel', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/49f1d6bec044b43e8bfe8e4a0806ee64b3a9b0508031ae83813289d56061f114.png' },
    { id: 'manbun-beard', name: 'Man Bun + Barbe', category: 'Longs', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1565826087ce99280dfbc444cfed92d0a95d85c88d43c1b44923b33164fa14d5.png' },
    { id: 'freeformlocs-beard', name: 'Freeform Locs + Barbe', category: 'Locks', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1efb8f974489ab464d528e8fa9f1a403da994da578a77c895934add06bd6a8ee.png' },
  ];

  const categories = ['Tous', ...new Set(hairstyles.map(s => s.category))];
  
  const filteredStyles = selectedCategory === 'Tous' 
    ? hairstyles 
    : hairstyles.filter(s => s.category === selectedCategory);

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

  const selectStyle = (style) => {
    setSelectedStyle(style);
    setRotationAngle(0);
  };

  const generateSimulation = async () => {
    if (!selectedStyle) {
      Alert.alert('Style requis', 'Veuillez choisir un style de coiffure');
      return;
    }

    // SIMULATION IA ACCESSIBLE SANS CONNEXION
    setLoading(true);
    try {
      const requestData = {
        haircut_style: selectedStyle.name,
      };

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
    setRotationAngle(0);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Simulation IA</Text>
        <Text style={styles.subtitle}>
          30+ styles disponibles • Sans connexion requise
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
              {cat} {cat === 'Tous' ? `(${hairstyles.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Display with 360° */}
      {selectedStyle && (
        <View style={styles.mainDisplay}>
          <Text style={styles.viewLabel}>Vue 360° - {rotationLabels[rotationAngle]}</Text>
          <View style={styles.mannequinContainer}>
            <Image
              source={{ uri: selectedStyle.thumbnail }}
              style={[styles.mannequinImage, {
                transform: [{ scaleX: rotationAngle === 1 ? -1 : 1 }]
              }]}
            />
            <View style={styles.styleOverlay}>
              <Text style={styles.overlayTitle}>{selectedStyle.name}</Text>
              <Text style={styles.overlayCategory}>{selectedStyle.category}</Text>
            </View>
          </View>
          
          {/* 360° Controls */}
          <View style={styles.rotationControls}>
            <TouchableOpacity 
              style={styles.rotateBtn}
              onPress={() => setRotationAngle(prev => prev <= 0 ? 4 : prev - 1)}
            >
              <Ionicons name="arrow-undo" size={20} color="#FFD700" />
            </TouchableOpacity>
            
            <View style={styles.rotationDots}>
              {[0, 1, 2, 3, 4].map((angle) => (
                <TouchableOpacity
                  key={angle}
                  style={[styles.rotationDot, rotationAngle === angle && styles.rotationDotActive]}
                  onPress={() => setRotationAngle(angle)}
                >
                  <Text style={[styles.dotLabel, rotationAngle === angle && styles.dotLabelActive]}>
                    {rotationLabels[angle].split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.rotateBtn}
              onPress={() => setRotationAngle(prev => prev >= 4 ? 0 : prev + 1)}
            >
              <Ionicons name="arrow-redo" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Styles Grid - 30+ styles with images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'Tous' ? 'Tous les styles' : selectedCategory} ({filteredStyles.length})
        </Text>
        <View style={styles.stylesGrid}>
          {filteredStyles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[styles.styleCard, selectedStyle?.id === style.id && styles.styleCardSelected]}
              onPress={() => selectStyle(style)}
            >
              <Image source={{ uri: style.thumbnail }} style={styles.styleImage} />
              <View style={[styles.styleInfo, selectedStyle?.id === style.id && styles.styleInfoSelected]}>
                <Text style={[styles.styleName, selectedStyle?.id === style.id && styles.styleNameSelected]} numberOfLines={1}>
                  {style.name}
                </Text>
                <Text style={[styles.styleCategory, selectedStyle?.id === style.id && styles.styleCategorySelected]} numberOfLines={1}>
                  {style.category}
                </Text>
              </View>
              {selectedStyle?.id === style.id && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color="#0f172a" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Photo Section (Optional) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Votre photo (optionnel)</Text>
        <Text style={styles.sectionHint}>
          Prenez un selfie pour un résultat personnalisé
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
                <Ionicons name="camera" size={32} color="#FFD700" />
              </View>
              <Text style={styles.imageBtnTitle}>Selfie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
              <View style={styles.imageBtnIcon}>
                <Ionicons name="images" size={32} color="#FFD700" />
              </View>
              <Text style={styles.imageBtnTitle}>Galerie</Text>
            </TouchableOpacity>
          </View>
        )}
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
            style={[styles.generateBtn, !selectedStyle && styles.generateBtnDisabled]}
            onPress={generateSimulation}
            disabled={loading || !selectedStyle}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#0f172a" size="small" />
                <Text style={styles.generateBtnText}>Génération en cours...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="#0f172a" />
                <Text style={styles.generateBtnText}>
                  {selectedImage ? 'Transformer ma photo' : 'Générer la simulation'}
                </Text>
              </>
            )}
          </TouchableOpacity>
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
    color: '#FFD700',
    marginTop: 4,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#FFD700',
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  mainDisplay: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  viewLabel: {
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  mannequinContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mannequinImage: {
    width: '100%',
    height: '100%',
  },
  styleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 12,
  },
  overlayTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlayCategory: {
    color: '#94a3b8',
    fontSize: 12,
  },
  rotationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  rotateBtn: {
    padding: 10,
    backgroundColor: '#334155',
    borderRadius: 25,
  },
  rotationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rotationDot: {
    alignItems: 'center',
    padding: 4,
  },
  rotationDotActive: {},
  dotLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  dotLabelActive: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  styleCard: {
    width: (width - 52) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  styleCardSelected: {
    borderColor: '#FFD700',
  },
  styleImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#334155',
  },
  styleInfo: {
    padding: 8,
    backgroundColor: '#1e293b',
  },
  styleInfoSelected: {
    backgroundColor: '#FFD700',
  },
  styleName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  styleNameSelected: {
    color: '#0f172a',
  },
  styleCategory: {
    color: '#64748b',
    fontSize: 9,
  },
  styleCategorySelected: {
    color: '#1e293b',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFD700',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
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
  imagePreviewContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: width - 64,
    height: width - 64,
    borderRadius: 20,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#0f172a',
    borderRadius: 15,
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
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 12,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: '#0f172a',
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
});
