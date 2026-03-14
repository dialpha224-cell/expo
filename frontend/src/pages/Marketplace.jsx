import { useState, useEffect } from "react";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ShoppingCart,
  Star,
  Scissors,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

const Marketplace = () => {
  const { user, login } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);

  const categories = [
    { value: "all", label: "Tous les produits" },
    { value: "hair_care", label: "Soins capillaires" },
    { value: "styling", label: "Coiffage" },
    { value: "tools", label: "Outils" },
    { value: "accessories", label: "Accessoires" }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const url = selectedCategory === "all" 
        ? `${API}/products`
        : `${API}/products?category=${selectedCategory}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    toast.success(`${product.name} ajoute au panier`);
  };

  const checkout = async () => {
    if (!user) {
      login();
      return;
    }

    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        product_ids: cart.map(p => p.product_id),
        origin_url: window.location.origin
      }, { withCredentials: true });

      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Erreur lors du paiement");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-indigo-500" />
                <span className="font-heading font-bold text-white">AfroCrown</span>
              </a>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Marketplace</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  className="flex items-center gap-2 text-white"
                  data-testid="cart-btn"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
              {user ? (
                <span className="text-slate-400 text-sm">{user.name}</span>
              ) : (
                <Button onClick={login} className="bg-indigo-600 hover:bg-indigo-700" data-testid="login-btn">
                  Connexion
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </a>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Marketplace</h1>
          <p className="text-slate-400">Decouvrez les meilleurs produits capillaires selectionnes par nos experts.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
              data-testid="search-input"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
                data-testid={`category-${cat.value}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
              <span className="text-white">{cart.length} produit(s) dans le panier</span>
              <span className="text-indigo-400 font-bold">{cartTotal.toFixed(2)} EUR</span>
            </div>
            <Button 
              onClick={checkout}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-testid="checkout-btn"
            >
              Payer maintenant
            </Button>
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Aucun produit trouve</h3>
            <p className="text-slate-400">Essayez de modifier vos filtres de recherche.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all hover-lift"
                data-testid={`product-card-${product.product_id}`}
              >
                <div className="h-48 bg-slate-700 flex items-center justify-center relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-16 w-16 text-slate-600" />
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full">
                      Stock limite
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">
                      Rupture
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-semibold text-white">{product.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-white text-sm">4.8</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-heading font-bold text-indigo-400">{product.price} EUR</span>
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                      data-testid={`add-to-cart-${product.product_id}`}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
