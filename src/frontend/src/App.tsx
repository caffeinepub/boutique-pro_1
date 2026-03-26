import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminModal } from "./components/AdminModal";
import { ProductCard } from "./components/ProductCard";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useDeleteProduct,
  useGetProducts,
  useIsAdmin,
} from "./hooks/useQueries";
import type { Product } from "./hooks/useQueries";

const CATEGORIES = ["All", "Fashion", "Home Decor", "Gadgets", "Loot Deals"];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: BigInt(0),
    title: "Embroidered Anarkali Lehenga Set",
    price: 1299,
    mrp: 4999,
    imageUrl: "/assets/generated/product-lehenga.dim_600x700.jpg",
    affiliateLink: "https://meesho.com",
    category: "Fashion",
    trending: true,
  },
  {
    id: BigInt(1),
    title: "Indigo Block Print Cotton Kurta",
    price: 549,
    mrp: 1899,
    imageUrl: "/assets/generated/product-kurta.dim_600x700.jpg",
    affiliateLink: "https://meesho.com",
    category: "Fashion",
    trending: false,
  },
  {
    id: BigInt(2),
    title: "Marble & Gold Table Lamp",
    price: 899,
    mrp: 2999,
    imageUrl: "/assets/generated/product-lamp.dim_600x700.jpg",
    affiliateLink: "https://meesho.com",
    category: "Home Decor",
    trending: true,
  },
  {
    id: BigInt(3),
    title: "Floral Embroidered Canvas Tote",
    price: 349,
    mrp: 1299,
    imageUrl: "/assets/generated/product-tote.dim_600x700.jpg",
    affiliateLink: "https://meesho.com",
    category: "Fashion",
    trending: false,
  },
  {
    id: BigInt(4),
    title: "Premium TWS Earbuds with ANC",
    price: 799,
    mrp: 3499,
    imageUrl: "/assets/generated/product-earbuds.dim_600x700.jpg",
    affiliateLink: "https://meesho.com",
    category: "Gadgets",
    trending: true,
  },
  {
    id: BigInt(5),
    title: "Banarasi Silk Saree Dupe — Zari Border",
    price: 699,
    mrp: 3999,
    imageUrl: "/assets/generated/product-saree.dim_600x700.jpg",
    affiliateLink: "https://meesho.com",
    category: "Loot Deals",
    trending: true,
  },
];

// Check if the current URL contains the admin flag
function isAdminUrl(): boolean {
  return (
    window.location.search.includes("admin") ||
    window.location.hash.includes("admin")
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("trending");
  const [adminOpen, setAdminOpen] = useState(false);

  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const { data: backendProducts, isLoading } = useGetProducts();
  const deleteProduct = useDeleteProduct();

  const isLoggedInAdmin = !!identity && !!isAdmin;

  // Show gear icon when: already logged in OR visiting the ?admin / #admin URL
  const showGearIcon = !!identity || isAdminUrl();

  const allProducts: Product[] = useMemo(() => {
    // Admins always see real backend products (even if empty) — no sample fallback
    if (isLoggedInAdmin) return backendProducts ?? [];
    if (backendProducts && backendProducts.length > 0) return backendProducts;
    return SAMPLE_PRODUCTS;
  }, [backendProducts, isLoggedInAdmin]);

  const filtered = useMemo(() => {
    let result = allProducts;
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (sort === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else {
      result = [...result].sort(
        (a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0),
      );
    }
    return result;
  }, [allProducts, activeCategory, search, sort]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-boutique-pink-hot" />
              <span className="font-display font-bold text-lg text-foreground tracking-tight">
                Boutique <span className="text-boutique-pink-hot">Pro</span>
              </span>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-9 h-8 rounded-full text-sm border-border bg-secondary focus-visible:ring-accent"
                data-ocid="catalog.search_input"
              />
            </div>

            {/* Gear icon — visible when logged in OR when ?admin / #admin is in the URL */}
            {showGearIcon && (
              <button
                type="button"
                onClick={() => setAdminOpen(true)}
                className="flex-shrink-0 p-1.5 rounded-full hover:bg-secondary transition-colors"
                aria-label="Admin Dashboard"
                data-ocid="catalog.admin_open_modal_button"
              >
                <Settings className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-boutique-navy text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-boutique-pink-light hover:text-foreground"
                }`}
                data-ocid="catalog.filter.tab"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
        {/* Sort + Count Row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            {filtered.length} products
          </p>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger
              className="h-8 w-40 text-xs border-border"
              data-ocid="catalog.sort_select"
            >
              <SlidersHorizontal className="w-3 h-3 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            data-ocid="catalog.loading_state"
          >
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
              <div key={key} className="rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
            data-ocid="catalog.empty_state"
          >
            <ShoppingBag className="w-12 h-12 text-boutique-pink-mid mx-auto mb-3" />
            <p className="font-display text-lg font-semibold text-foreground">
              {isLoggedInAdmin ? "No products yet" : "No products found"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoggedInAdmin
                ? "Tap the + button to add your first product"
                : "Try a different search or category"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={i}
                  isAdmin={isLoggedInAdmin}
                  onDelete={(id) => {
                    deleteProduct.mutate(id, {
                      onSuccess: () => toast.success("Product deleted"),
                      onError: () => toast.error("Failed to delete product"),
                    });
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center relative">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Boutique Pro. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>

          {/* Hidden admin entry point — tiny, low-opacity dot in the bottom-right corner */}
          <button
            type="button"
            onClick={() => setAdminOpen(true)}
            aria-label="Admin access"
            data-ocid="catalog.hidden_admin_button"
            className="absolute bottom-0 right-0 w-5 h-5 opacity-0 hover:opacity-10 transition-opacity rounded-full"
            title=""
          />
        </div>
      </footer>

      {/* Floating Add Button — visible to admins or when ?admin is in URL */}
      {(isLoggedInAdmin || isAdminUrl()) && (
        <motion.button
          type="button"
          onClick={() => setAdminOpen(true)}
          aria-label="Add Product"
          data-ocid="catalog.fab_add_button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-boutique-pink-hot text-white flex items-center justify-center shadow-lg shadow-boutique-pink-hot/40 hover:shadow-xl hover:shadow-boutique-pink-hot/50 transition-shadow"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Admin Modal */}
      <AnimatePresence>
        {adminOpen && <AdminModal onClose={() => setAdminOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
