import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://salon-dashboard-48.preview.emergentagent.com/api';

export default function AISimulationScreen() {
  const router = useRouter();
  const { user, token, login } = useAuth();
  const [imageUrl, setImageUrl] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const haircutStyles = [
    { id: 'fade', name: 'Degrade Classique' },
    { id: 'afro', name: 'Afro Naturelle' },
    { id: 'buzz', name: 'Buzz Cut' },
    { id: 'high-top', name: 'High Top Fade' },
    { id: 'waves', name: '360 Waves' },
    { id: 'locks', name: 'Starter Locks' },
    { id: 'braids', name: 'Cornrows' },
    { id: 'mohawk', name: 'Mohawk Fade' },
  ];

  const handleSimulation = async () => {
    if (!user) {
      alert('Veuillez vous connecter');
      login();
      return;
    }

    if (!imageUrl || !selectedStyle) {
      alert('Veuillez entrer une URL et selectionner un style');
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const style = haircutStyles.find(s => s.id === selectedStyle);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(`${API_URL}/ai/simulate-haircut`, {
        image_url: imageUrl,
        haircut_style: style?.name || selectedStyle
      }, { headers });

      if (response.data.image_base64) {
        setGeneratedImage(`data:image/png;base64,${response.data.image_base64}`);
      }
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Erreur lors de la simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="sparkles" size={20} color="#22D3EE" />
          <Text style={styles.headerTitle}>Simulation IA</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Simulez votre future coupe</Text>
          <Text style={styles.subtitle}>
            Uploadez une photo et decouvrez differents styles
          </Text>
        </View>

        {/* Image URL Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={20} color="#818cf8" />
            <Text style={styles.sectionTitle}>Votre photo</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Collez l'URL de votre photo..."
            placeholderTextColor="#64748B"
            value={imageUrl}
            onChangeText={setImageUrl}
          />
          {imageUrl ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            </View>
          ) : null}
        </View>

        {/* Style Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cut" size={20} color="#818cf8" />
            <Text style={styles.sectionTitle}>Style de coupe</Text>
          </View>
          <View style={styles.stylesGrid}>
            {haircutStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[styles.styleCard, selectedStyle === style.id && styles.styleCardSelected]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Text style={[styles.styleCardText, selectedStyle === style.id && styles.styleCardTextSelected]}>
                  {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, (!imageUrl || !selectedStyle) && styles.generateButtonDisabled]}
          onPress={handleSimulation}
          disabled={loading || !imageUrl || !selectedStyle}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.generateButtonText}>Generer la simulation</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Result */}
        {generatedImage && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Resultat</Text>
            <View style={styles.resultImageContainer}>
              <Image source={{ uri: generatedImage }} style={styles.resultImage} />
            </View>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setGeneratedImage(null);
                setSelectedStyle('');
              }}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.resetButtonText}>Recommencer</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingSection}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="sparkles" size={32} color="#22D3EE" />
            </View>
            <Text style={styles.loadingText}>Generation en cours...</Text>
            <Text style={styles.loadingSubtext}>Cela peut prendre jusqu'a 1 minute</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22D3EE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleCard: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  styleCardSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  styleCardText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  styleCardTextSelected: {
    color: '#fff',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 24,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    marginBottom: 40,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  resultImageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  loadingSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  loadingSubtext: {
    color: '#64748B',
    fontSize: 14,
  },
});
