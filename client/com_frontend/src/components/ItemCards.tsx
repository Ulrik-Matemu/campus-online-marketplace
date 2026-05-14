import { useNavigate } from "react-router-dom";
import type { ProductSummary, ServiceSummary } from "../types/api";
import { Badge, Card, conditionVariant } from "./ui";
import { formatPrice } from "../lib/format";

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const thumbnail = product.images[0]?.url;

  return (
    <Card
      hoverable
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-stone-100 dark:bg-stone-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-stone-300 dark:text-stone-600">
            📦
          </div>
        )}
        {/* Multiple images indicator */}
        {product.images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
            +{product.images.length - 1}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="truncate font-medium text-stone-900 dark:text-stone-100">
          {product.title}
        </h3>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
            {formatPrice(product.price)}
          </span>
          <Badge
            label={product.condition}
            variant={conditionVariant(product.condition)}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
          <span>{product.category}</span>
          <span>{product.owner.campus}</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceSummary;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      onClick={() => navigate(`/services/${service._id}`)}
    >
      {/* Color accent header */}
      <div className="flex items-center gap-3 rounded-t-xl bg-gradient-to-br from-teal-50 to-teal-100/50 p-4 dark:from-teal-950/40 dark:to-teal-900/20">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-500 text-lg text-white">
          {service.title.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-medium text-stone-900 dark:text-stone-100">
            {service.title}
          </h3>
          <p className="text-xs text-stone-500">{service.category}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
          {service.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-teal-600 dark:text-teal-400">
              {formatPrice(service.rate)}
            </span>
            <span className="ml-1 text-xs text-stone-500">
              / {service.rateType === "hourly" ? "hr" : "fixed"}
            </span>
          </div>
          <span className="text-xs text-stone-500">{service.provider.campus}</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Mixed Search Result Card ─────────────────────────────────────────────────

import type { SearchResultItem } from "../types/api";

interface SearchCardProps {
  item: SearchResultItem;
}

export function SearchCard({ item }: SearchCardProps) {
  if (item._type === "product") return <ProductCard product={item} />;
  return <ServiceCard service={item} />;
}
