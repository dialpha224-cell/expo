import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

export default function MarketplaceScreen() {
  const { API_URL } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tous', 'Soins', 'Coiffage', 'Accessoires']);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.log('Error fetching products:', error);
      // Demo products
      setProducts([
        { product_id: '1', name: 'Huile de Coco Bio', price: 15.99, category: 'Soins', image_url: null },
        { product_id: '2', name: 'Creme Hydratante Karite', price: 22.50, category: 'Soins', image_url: null },
        { product_id: '3', name: 'Gel Coiffant Naturel', price: 12.00, category: 'Coiffage', image_url: null },
        { product_id: '4', name: 'Peigne Afro XL', price: 8.99, category: 'Accessoires', image_url: null },
        { product_id: '5', name: 'Bonnet Satin', price: 14.99, category: 'Accessoires', image_url: null },
        { product_id: '6', name: 'Spray Demulant', price: 18.00, category: 'Soins', image_url: null },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const filteredProducts = selectedCategory === 'Tous' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Produits capillaires de qualite</Text>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity key={product.product_id} style={styles.productCard}>
              <View style={styles.productImage}>
                {product.image_url ? (
                  <Image source={{ uri: product.image_url }} style={styles.productImg} />
                ) : (
                  <Ionicons name="cube-outline" size={40} color="#64748b" />
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>{product.price?.toFixed(2)} EUR</Text>
              </View>
              <TouchableOpacity style={styles.addToCartBtn}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={60} color="#64748b" />
            <Text style={styles.emptyText}>Aucun produit disponible</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
    paddingTop: 8,
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
  categoriesScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: '#6366f1',
  },
  categoryText: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#818cf8',
  },
  addToCartBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#6366f1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
  },
  emptyText: {
    color: '#64748b',
    marginTop: 16,
    fontSize: 14,
  },
});
