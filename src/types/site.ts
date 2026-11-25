export type ProductBadgeType = 'BARU' | 'PALING LARIS' | null;

export interface FeaturedProduct {
  slug: string;
  name: string;
  duration: string;
  price: number;
  badge: ProductBadgeType;
  description: string;
  logo: string;
}

export interface FlashSaleItem {
  slug: string;
  name: string;
  duration: string;
  originalPrice: number;
  promoPrice: number;
  stockLeft: number;
  stockTotal: number;
  logo: string;
}

export interface CategoryItem {
  id: string;
  title: string;
  examples: string;
  serviceCountLabel: string;
  href: string;
  featured?: boolean;
}

export interface MarqueeLogoItem {
  name: string;
  logo: string;
}

export interface ProductsData {
  storeBaseUrl: string;
  featuredProducts: FeaturedProduct[];
  flashSale: {
    title: string;
    subtitle: string;
    endsAt: string;
    lowStockLabel: string;
    items: FlashSaleItem[];
  };
  categories: CategoryItem[];
  marqueeLogos: MarqueeLogoItem[];
  reelTickerItems: string[];
}
