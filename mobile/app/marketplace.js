import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://salon-dashboard-48.preview.emergentagent.com/api';

export default function MarketplaceScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'hair_care', label: 'Soins' },
    { id: 'styling', label: 'Coiffage' },
    { id: 'tools', label: 'Outils' },
    { id: 'accessories', label: 'Accessoires' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? `${API_URL}/products`
        : `${API_URL}/products?category=${selectedCategory}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart" size={24} color="#fff" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          placeholderTextColor="#64748B"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartSummaryLeft}>
            <Ionicons name="cart" size={20} color="#818cf8" />
            <Text style={styles.cartSummaryText}>{cart.length} produit(s)</Text>
            <Text style={styles.cartSummaryPrice}>{cartTotal.toFixed(2)} EUR</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Payer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products Grid */}
      <ScrollView style={styles.productsContainer}>
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <View key={product.product_id} style={styles.productCard}>
              <View style={styles.productImage}>
                <Ionicons name="bag" size={40} color="#64748B" />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{product.price} EUR</Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => addToCart(product)}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4F46E5',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#4F46E5',
  },
  categoryChipText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cartSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartSummaryText: {
    color: '#fff',
  },
  cartSummaryPrice: {
    color: '#818cf8',
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    height: 120,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#818cf8',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
