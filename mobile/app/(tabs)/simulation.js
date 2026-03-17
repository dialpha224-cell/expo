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
  FlatList,
  SafeAreaView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 3; // 3 colonnes avec padding

export default function SimulationScreen() {
  const { user, API_URL } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const rotationLabels = {
    0: "Face",
    1: "Droite", 
    2: "Dos",
    3: "Gauche",
    4: "Dessus"
  };

  // 30+ styles de coiffure avec images AI
  const hairstyles = [
    { id: 'taper-beard', name: 'Taper Fade', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/5a74bd03d51115436d28479c2be767eaf3a6ecf2eebdc673c11baea9501e31f9.png' },
    { id: 'waves-beard', name: '360 Waves', category: 'Waves', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/43162635dc0d00a032ccda23f09c1c00a668c10147ce7e6c81257d9eec8794f2.png' },
    { id: 'hightop-goatee', name: 'High Top', category: 'Afro', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/40b52420728e44958ec43d1b43c6ebf627fc4f62d851326ce2ea13f5cfa65142.png' },
    { id: 'lowfade-stubble', name: 'Low Fade', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2f6f5d11cb075a185e06d5743a8eb1999dff8876d3eedebf66986f45a5ee0c1.png' },
    { id: 'afro-beard', name: 'Afro Naturel', category: 'Afro', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/f7191e3c2abff0ea8910c590ea46a5526f72a83c50bce88d8b26e2198f7bb711.png' },
    { id: 'buzz-beard', name: 'Buzz Cut', category: 'Courts', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/44d43007533a0f29551419ff5e7dcb0286bb49094bebd58a0b2009d05bc71c46.png' },
    { id: 'skinfade-designer', name: 'Skin Fade', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1cc5a0d53b27b2dccd59175fa06c52b6a17bec24b892989b5f4ca0b4a75adf06.png' },
    { id: 'cornrows-beard', name: 'Cornrows', category: 'Tresses', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/bdb3eac0e84fbe1461b2c24dfce96ad900165677102caf19a4687da360ecccd2.png' },
    { id: 'fulani-beard', name: 'Fulani', category: 'Tresses', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/2368e2dec7ce77152ed9d3f7340f46b92f6adb7cf7e8f2402de3de8b88e53583.png' },
    { id: 'shortdreads-beard', name: 'Dreads Courts', category: 'Locks', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b8413b9853ad7a25153d000160a63fe913900717d137f217c971e09706df05c5.png' },
    { id: 'longdreads-beard', name: 'Dreads Longs', category: 'Locks', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/83d2b5f2e66feb00f42f3da42d59370c5b3dd52afc5673c6614edfa81a967f65.png' },
    { id: 'boxbraids-beard', name: 'Box Braids', category: 'Tresses', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ab542ae1dc216b005dc3d4129e920c5a64e802ec1b5ce3072417513c9e64a844.png' },
    { id: 'twists-beard', name: 'Twists', category: 'Naturel', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ea04d4455635e9a34c3d458ec2f3dcc6d6a63cd05c694f09965be4a90c825758.png' },
    { id: 'templefade-curly', name: 'Temple Fade', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/df2794ebe0d795d4053f8a6260b7051d9feb4d49f24aa9195a43c6b1d2f245dc.png' },
    { id: 'mohawk-beard', name: 'Mohawk', category: 'Créatifs', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/72803f33fd1066f9034aec361385b429e29f83d94c89a76334e0a5be3fb8ddf5.png' },
    { id: 'frohawk-goatee', name: 'Frohawk', category: 'Créatifs', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/289bb0be7e22cf6acb555643eede436b0270e22c59e4cbfe03aa6de559ea3b5f.png' },
    { id: 'dropfade-beard', name: 'Drop Fade', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/51a0fd6b16b029dc9e0f74fd5ca1e1803cc1e283e6da74013ea6422556d356aa.png' },
    { id: 'burstfade-beard', name: 'Burst Fade', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/45d97352c35d9d92b46fe8755375b45b5e49aca3da1bd42e313319e91f3ad554.png' },
    { id: 'flattop-beard', name: 'Flat Top', category: 'Afro', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/973777cd63edf86e0b12f75c56145f6a9224582ecb6a00d1bc3a493b46c5f4c5.png' },
    { id: 'bald-fullbeard', name: 'Crâne Rasé', category: 'Courts', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/6c5cde2836906732a1c431c826b5070ea52279f9c734979ec5e4558c6017d6b7.png' },
    { id: 'sidepart-beard', name: 'Raie Côté', category: 'Classiques', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/a430e13090c40f0bc64e1d05a1fbaebb9c67827b5e296b3c9799d58f1f2169e1.png' },
    { id: 'combover-beard', name: 'Comb Over', category: 'Classiques', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/20af7735ebeb3253f02d6f197e26ae05e8f2bb8bb9a8d81f48975fa9c0d2aad4.png' },
    { id: 'edgar-beard', name: 'Edgar Cut', category: 'Tendance', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ba8aa82c90b19714624ca5adc0ca003f37ef746be37acef21ac46157e07c467e.png' },
    { id: 'texturedcrop-beard', name: 'Texture Crop', category: 'Tendance', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/d9bc229084a7d1bcdb5c85d921e50a0db42c5077cb1a0b02284a91e2f20e87a9.png' },
    { id: 'midfade-curls', name: 'Mid Fade', category: 'Dégradés', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/3eb45be6976c1ab3463e48bc3dcbc9cf6461bb331014491e2783662e7c532de0.png' },
    { id: 'twistout-beard', name: 'Twist Out', category: 'Naturel', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/0dcaa98a76adde5f5a2a2d93bd2965634d0ba4e962fc7f1e41e788e64d3493e6.png' },
    { id: 'fingercoils-beard', name: 'Finger Coils', category: 'Naturel', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ec8ec68c45eb05545778c343a7f013edf52fff36f3361046b14f637f08e5b10a.png' },
    { id: 'tapernatural-beard', name: 'Taper Naturel', category: 'Naturel', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/49f1d6bec044b43e8bfe8e4a0806ee64b3a9b0508031ae83813289d56061f114.png' },
    { id: 'manbun-beard', name: 'Man Bun', category: 'Longs', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1565826087ce99280dfbc444cfed92d0a95d85c88d43c1b44923b33164fa14d5.png' },
    { id: 'freeformlocs-beard', name: 'Freeform Locs', category: 'Locks', thumbnail: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1efb8f974489ab464d528e8fa9f1a403da994da578a77c895934add06bd6a8ee.png' },
  ];

  const categories = ['Tous', ...new Set(hairstyles.map(s => s.category))];
  
  const filteredStyles = selectedCategory === 'Tous' 
    ? hairstyles 
    : hairstyles.filter(s => s.category === selectedCategory);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos');
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
      setShowPhotoOptions(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à la caméra');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setResultImage(null);
      setShowPhotoOptions(false);
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
      }
    } catch (error) {
      console.log('Simulation error:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la simulation');
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

  const renderStyleCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.styleCard, selectedStyle?.id === item.id && styles.styleCardSelected]}
      onPress={() => selectStyle(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.styleImage} resizeMode="cover" />
      <View style={[styles.styleInfo, selectedStyle?.id === item.id && styles.styleInfoSelected]}>
        <Text style={[styles.styleName, selectedStyle?.id === item.id && styles.styleNameSelected]} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      {selectedStyle?.id === item.id && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={12} color="#0f172a" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 20) + 80 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header compact */}
        <View style={styles.header}>
          <Text style={styles.title}>Simulation IA</Text>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color="#0f172a" />
            <Text style={styles.badgeText}>{hairstyles.length} styles</Text>
          </View>
        </View>

        {/* Preview Section - Style sélectionné ou placeholder */}
        <View style={styles.previewSection}>
          {selectedStyle ? (
            <View style={styles.selectedPreview}>
              <Image source={{ uri: selectedStyle.thumbnail }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewOverlay}>
                <Text style={styles.previewTitle}>{selectedStyle.name}</Text>
                <Text style={styles.previewCategory}>{selectedStyle.category}</Text>
              </View>
              
              {/* 360° Controls */}
              <View style={styles.rotationBar}>
                <TouchableOpacity 
                  style={styles.rotateBtn}
                  onPress={() => setRotationAngle(prev => prev <= 0 ? 4 : prev - 1)}
                >
                  <Ionicons name="chevron-back" size={18} color="#FFD700" />
                </TouchableOpacity>
                
                <View style={styles.rotationIndicator}>
                  {[0, 1, 2, 3, 4].map((angle) => (
                    <TouchableOpacity
                      key={angle}
                      style={[styles.rotationDot, rotationAngle === angle && styles.rotationDotActive]}
                      onPress={() => setRotationAngle(angle)}
                    />
                  ))}
                </View>
                <Text style={styles.rotationLabel}>{rotationLabels[rotationAngle]}</Text>
                
                <TouchableOpacity 
                  style={styles.rotateBtn}
                  onPress={() => setRotationAngle(prev => prev >= 4 ? 0 : prev + 1)}
                >
                  <Ionicons name="chevron-forward" size={18} color="#FFD700" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderPreview}>
              <Ionicons name="cut-outline" size={40} color="#64748b" />
              <Text style={styles.placeholderText}>Sélectionnez un style</Text>
            </View>
          )}
        </View>

        {/* Categories - Scroll horizontal */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Styles Grid - 3 colonnes */}
        <View style={styles.stylesSection}>
          <Text style={styles.sectionTitle}>
            {filteredStyles.length} coiffures
          </Text>
          <FlatList
            data={filteredStyles}
            renderItem={renderStyleCard}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContent}
          />
        </View>

        {/* Photo Section (Compact) */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Votre photo (optionnel)</Text>
          
          {selectedImage ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: selectedImage.uri }} style={styles.userPhoto} />
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setSelectedImage(null)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#FFD700" />
                <Text style={styles.photoBtnText}>Selfie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                <Ionicons name="images" size={24} color="#FFD700" />
                <Text style={styles.photoBtnText}>Galerie</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Result */}
        {resultImage && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Résultat</Text>
            <Image source={{ uri: resultImage }} style={styles.resultImage} resizeMode="cover" />
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.resultBtn}>
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.resultBtnText}>Sauvegarder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resultBtn}>
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text style={styles.resultBtnText}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Generate Button */}
      <View style={styles.bottomBar}>
        {resultImage ? (
          <TouchableOpacity style={styles.resetButton} onPress={resetSimulation}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Nouvelle simulation</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.generateButton, !selectedStyle && styles.buttonDisabled]}
            onPress={generateSimulation}
            disabled={loading || !selectedStyle}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#0f172a" size="small" />
                <Text style={styles.buttonTextDark}>Génération...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#0f172a" />
                <Text style={styles.buttonTextDark}>Générer la simulation</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  
  // Preview Section
  previewSection: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  selectedPreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#334155',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  previewCategory: {
    fontSize: 12,
    color: '#94a3b8',
  },
  rotationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
  },
  rotateBtn: {
    padding: 6,
  },
  rotationIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  rotationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  rotationDotActive: {
    backgroundColor: '#FFD700',
  },
  rotationLabel: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'center',
  },
  placeholderPreview: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  
  // Categories
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FFD700',
  },
  categoryText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  
  // Styles Grid
  stylesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 10,
  },
  gridContent: {
    gap: 8,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  styleCard: {
    width: CARD_SIZE,
    borderRadius: 10,
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
    padding: 6,
  },
  styleInfoSelected: {
    backgroundColor: '#FFD700',
  },
  styleName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  styleNameSelected: {
    color: '#0f172a',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD700',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Photo Section
  photoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  photoBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  photoPreview: {
    alignSelf: 'center',
    position: 'relative',
  },
  userPhoto: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Result Section
  resultSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#334155',
    marginBottom: 12,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  resultBtnText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
});
