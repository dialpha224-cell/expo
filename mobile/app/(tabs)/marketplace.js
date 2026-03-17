import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function MarketplaceScreen() {
  const { API_URL } = useAuth();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tous', 'Soins', 'Coiffage', 'Accessoires', 'Matériel']);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      // Demo products
      setProducts([
        { product_id: '1', name: 'Huile de Coco Bio', price: 15.99, category: 'Soins', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200' },
        { product_id: '2', name: 'Crème Hydratante Karité', price: 22.50, category: 'Soins', image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200' },
        { product_id: '3', name: 'Gel Coiffant Naturel', price: 12.00, category: 'Coiffage', image_url: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=200' },
        { product_id: '4', name: 'Peigne Afro XL', price: 8.99, category: 'Accessoires', image_url: null },
        { product_id: '5', name: 'Bonnet Satin', price: 14.99, category: 'Accessoires', image_url: null },
        { product_id: '6', name: 'Spray Démêlant', price: 18.00, category: 'Soins', image_url: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=200' },
        { product_id: '7', name: 'Tondeuse Pro', price: 89.00, category: 'Matériel', image_url: null },
        { product_id: '8', name: 'Ciseaux Coiffure', price: 35.00, category: 'Matériel', image_url: null },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const filteredProducts = selectedCategory === 'Tous' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 20) + 80 : 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Shop</Text>
            <Text style={styles.subtitle}>Produits capillaires de qualité</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn}>
            <Ionicons name="cart" size={22} color="#FFD700" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Count */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>{filteredProducts.length} produits</Text>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity key={product.product_id} style={styles.productCard} activeOpacity={0.7}>
              <View style={styles.productImage}>
                {product.image_url ? (
                  <Image source={{ uri: product.image_url }} style={styles.productImg} resizeMode="cover" />
                ) : (
                  <View style={styles.productPlaceholder}>
                    <Ionicons name="cube-outline" size={32} color="#64748b" />
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>{product.price?.toFixed(2)}€</Text>
                  <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => addToCart(product)}
                  >
                    <Ionicons name="add" size={18} color="#0f172a" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#64748b" />
            <Text style={styles.emptyText}>Aucun produit disponible</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  cartBtn: {
    position: 'relative',
    padding: 10,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFD700',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  
  // Categories
  categoriesScroll: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    marginRight: 8,
  },
  categoryPillActive: {
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
  
  // Results
  resultsRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 13,
    color: '#64748b',
  },
  
  // Products Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#0f172a',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    height: 36,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  addBtn: {
    backgroundColor: '#FFD700',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#64748b',
    marginTop: 12,
    fontSize: 13,
  },
});
