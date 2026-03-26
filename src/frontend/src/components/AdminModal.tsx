import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Edit2,
  Loader2,
  LogIn,
  Plus,
  Save,
  Shield,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useClearAllProducts,
  useDeleteProduct,
  useGetProducts,
  useInitializeAdmin,
  useIsAdmin,
  useUpdateProduct,
} from "../hooks/useQueries";
import type { Product } from "../hooks/useQueries";

const CATEGORIES = ["Fashion", "Home Decor", "Gadgets", "Loot Deals"];

type ProductForm = Omit<Product, "id">;

const EMPTY_FORM: ProductForm = {
  title: "",
  price: 0,
  mrp: 0,
  imageUrl: "",
  affiliateLink: "",
  category: "Fashion",
  trending: false,
};

interface AdminModalProps {
  onClose: () => void;
}

export function AdminModal({ onClose }: AdminModalProps) {
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const { data: products = [] } = useGetProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const clearAllProducts = useClearAllProducts();
  const initializeAdmin = useInitializeAdmin();

  const [form, setForm] = useState<ProductForm>({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [adminSecret, setAdminSecret] = useState("");

  const isLoggedIn = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }
    try {
      if (editingId !== null) {
        await updateProduct.mutateAsync({ id: editingId, product: form });
        toast.success("Product updated!");
        setEditingId(null);
      } else {
        await addProduct.mutateAsync(form);
        toast.success("Product added!");
      }
      setForm({ ...EMPTY_FORM });
    } catch (err) {
      toast.error(
        editingId !== null
          ? "Failed to update product"
          : "Failed to add product",
      );
      console.error(err);
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      price: p.price,
      mrp: p.mrp,
      imageUrl: p.imageUrl,
      affiliateLink: p.affiliateLink,
      category: p.category,
      trending: p.trending,
    });
    document
      .getElementById("product-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleDelete = async (id: bigint) => {
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }
    try {
      await deleteProduct.mutateAsync(id);
      if (editingId === id) {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
      }
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete all products? This cannot be undone.")) return;
    try {
      await clearAllProducts.mutateAsync();
      toast.success("All products deleted");
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
    } catch (err) {
      toast.error("Failed to delete all products");
      console.error(err);
    }
  };

  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret.trim()) return;
    try {
      await initializeAdmin.mutateAsync(adminSecret);
      toast.success("Admin access granted!");
      setAdminSecret("");
    } catch (err) {
      toast.error("Invalid secret or admin already claimed");
      console.error(err);
    }
  };

  const isPending = addProduct.isPending || updateProduct.isPending;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-ocid="admin.modal"
      >
        {/* Backdrop */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Close admin panel"
          className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />

        {/* Panel */}
        <motion.aside
          className="relative ml-auto w-full max-w-md bg-card shadow-2xl flex flex-col h-full"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Admin Suite
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your product catalog
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-ocid="admin.close_button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-6">
              {/* Auth Section */}
              {!isLoggedIn ? (
                <div className="bg-boutique-pink-light rounded-xl p-4 text-center space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Login with Internet Identity to manage products
                  </p>
                  <Button
                    onClick={() => login()}
                    disabled={loginStatus === "logging-in"}
                    className="bg-boutique-navy text-white w-full"
                    data-ocid="admin.login_button"
                  >
                    {loginStatus === "logging-in" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 mr-2" />
                    )}
                    Login with Internet Identity
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-secondary rounded-xl px-4 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Logged in as
                    </p>
                    <p className="text-xs font-mono font-medium text-foreground truncate max-w-[200px]">
                      {identity.getPrincipal().toString().slice(0, 24)}…
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clear()}
                    className="text-xs text-muted-foreground"
                    data-ocid="admin.logout_button"
                  >
                    Logout
                  </Button>
                </div>
              )}

              {/* Admin Claim Section — show when logged in but not yet admin */}
              {isLoggedIn && !isAdmin && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800">
                      Claim Admin Access
                    </p>
                  </div>
                  <p className="text-xs text-amber-700">
                    Enter your admin secret to set up your admin account.
                  </p>
                  <form onSubmit={handleClaimAdmin} className="flex gap-2">
                    <Input
                      type="password"
                      value={adminSecret}
                      onChange={(e) => setAdminSecret(e.target.value)}
                      placeholder="Admin secret token"
                      className="h-9 text-sm flex-1"
                      data-ocid="admin.secret_input"
                    />
                    <Button
                      type="submit"
                      disabled={
                        initializeAdmin.isPending || !adminSecret.trim()
                      }
                      className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-3"
                      data-ocid="admin.claim_button"
                    >
                      {initializeAdmin.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Claim"
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* Add / Edit Product Form */}
              {isAdmin && (
                <>
                  <div id="product-form">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-base">
                        {editingId !== null
                          ? "Edit Product"
                          : "Add New Product"}
                      </h3>
                      {editingId !== null && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="text-xs text-muted-foreground h-7"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium">
                          Product Name
                        </Label>
                        <Input
                          value={form.title}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, title: e.target.value }))
                          }
                          placeholder="Designer Silk Saree Dupe"
                          required
                          className="mt-1 h-9 text-sm"
                          data-ocid="admin.title_input"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium">Category</Label>
                        <Select
                          value={form.category}
                          onValueChange={(v) =>
                            setForm((f) => ({ ...f, category: v }))
                          }
                        >
                          <SelectTrigger
                            className="mt-1 h-9 text-sm"
                            data-ocid="admin.category_select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium">
                          Meesho Image URL
                        </Label>
                        <Input
                          value={form.imageUrl}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              imageUrl: e.target.value,
                            }))
                          }
                          placeholder="https://images.meesho.com/..."
                          required
                          className="mt-1 h-9 text-sm"
                          data-ocid="admin.image_url_input"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium">
                            Current Price (₹)
                          </Label>
                          <Input
                            type="number"
                            value={form.price || ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                price: Number(e.target.value),
                              }))
                            }
                            placeholder="799"
                            required
                            min={1}
                            className="mt-1 h-9 text-sm"
                            data-ocid="admin.price_input"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">MRP (₹)</Label>
                          <Input
                            type="number"
                            value={form.mrp || ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                mrp: Number(e.target.value),
                              }))
                            }
                            placeholder="2499"
                            required
                            min={1}
                            className="mt-1 h-9 text-sm"
                            data-ocid="admin.mrp_input"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium">
                          Affiliate Link
                        </Label>
                        <Input
                          value={form.affiliateLink}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              affiliateLink: e.target.value,
                            }))
                          }
                          placeholder="https://earnkaro.com/..."
                          required
                          className="mt-1 h-9 text-sm"
                          data-ocid="admin.affiliate_link_input"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="trending"
                          checked={form.trending}
                          onCheckedChange={(v) =>
                            setForm((f) => ({ ...f, trending: !!v }))
                          }
                          data-ocid="admin.trending_checkbox"
                        />
                        <Label
                          htmlFor="trending"
                          className="text-xs font-medium cursor-pointer"
                        >
                          Mark as Trending
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-boutique-navy text-white h-9"
                        data-ocid="admin.submit_button"
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : editingId !== null ? (
                          <Save className="w-4 h-4 mr-2" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {editingId !== null ? "Save Changes" : "Add Product"}
                      </Button>
                    </form>
                  </div>

                  {/* Clear All Products */}
                  {products.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full border-destructive text-destructive hover:bg-destructive/10"
                      onClick={handleClearAll}
                      disabled={clearAllProducts.isPending}
                      data-ocid="admin.clear_all_button"
                    >
                      {clearAllProducts.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Clear All Products
                    </Button>
                  )}

                  <Separator />

                  {/* Product List */}
                  <div>
                    <h3 className="font-display font-semibold text-base mb-3">
                      Catalog ({products.length})
                    </h3>
                    <div className="space-y-2">
                      {products.map((p, i) => (
                        <div
                          key={p.id.toString()}
                          className={`flex items-center gap-3 p-2 rounded-lg border bg-background transition-colors ${
                            editingId === p.id
                              ? "border-boutique-navy ring-1 ring-boutique-navy/20"
                              : "border-border"
                          }`}
                          data-ocid={`admin.item.${i + 1}`}
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-10 h-12 object-cover rounded-md flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/assets/generated/product-lehenga.dim_600x700.jpg";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              ₹{p.price} · {p.category}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-boutique-navy hover:text-boutique-navy"
                              onClick={() => handleEdit(p)}
                              disabled={deleteProduct.isPending}
                              data-ocid={`admin.edit_button.${i + 1}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(p.id)}
                              disabled={deleteProduct.isPending}
                              data-ocid={`admin.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <p
                          className="text-xs text-muted-foreground text-center py-4"
                          data-ocid="admin.empty_state"
                        >
                          No products yet — add your first product above
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}
