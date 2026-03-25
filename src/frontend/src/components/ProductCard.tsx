import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../hooks/useQueries";

const CATEGORY_COLORS: Record<string, string> = {
  Fashion: "bg-boutique-pink-light text-boutique-navy border-boutique-pink-mid",
  "Home Decor": "bg-secondary text-secondary-foreground border-border",
  Gadgets: "bg-muted text-muted-foreground border-border",
  "Loot Deals": "bg-accent text-accent-foreground border-transparent",
};

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const discount = Math.round(
    ((product.mrp - product.price) / product.mrp) * 100,
  );
  const categoryClass =
    CATEGORY_COLORS[product.category] ||
    "bg-secondary text-secondary-foreground border-border";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex flex-col bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-secondary">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.trending && (
          <span className="absolute top-2 right-2 bg-boutique-navy text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-current" /> Trending
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Category Badge */}
        <Badge
          variant="outline"
          className={`self-start text-[10px] font-medium ${categoryClass}`}
        >
          {product.category}
        </Badge>

        {/* Title */}
        <h3 className="font-sans font-semibold text-sm leading-snug text-foreground line-clamp-2">
          {product.title}
        </h3>

        {/* Verified Quality badge */}
        <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
          Verified Quality
        </p>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="font-display font-bold text-base text-boutique-pink-hot">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Buy Now */}
        <Button
          asChild
          className="w-full mt-1 bg-boutique-navy text-white hover:bg-primary/90 text-xs h-8 rounded-xl font-semibold"
          data-ocid="product.button"
        >
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Buy Now
          </a>
        </Button>
      </div>
    </motion.article>
  );
}
