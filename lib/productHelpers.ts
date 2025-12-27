import { Prisma, Season } from "@prisma/client";
import { ProductFilter } from "./types";

export const buildProductFilter = (filters: ProductFilter): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = {};

  if (filters.category) {
    where.categoryId = filters.category;
  }

  if (filters.season) {
    where.season = filters.season;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters.inStock) {
    where.stock = { gt: 0 };
  }

  if (filters.fabric) {
    where.fabric = { contains: filters.fabric, mode: "insensitive" };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
};

export const buildProductSort = (sortBy?: "price" | "newest" | "popularity"): Prisma.ProductOrderByWithRelationInput => {
  switch (sortBy) {
    case "price":
      return { price: "asc" };
    case "newest":
      return { createdAt: "desc" };
    case "popularity":
      // For now, we'll sort by stock (assuming popular items sell more)
      // In production, this would be based on order count
      return { stock: "desc" };
    default:
      return { createdAt: "desc" };
  }
};

export const filterProductsBySizesAndColors = (products: any[], sizes?: string[], colors?: string[]) => {
  let filtered = products;

  if (sizes && sizes.length > 0) {
    filtered = filtered.filter((product) => {
      const productSizes = product.sizes as string[];
      return sizes.some((size) => productSizes.includes(size));
    });
  }

  if (colors && colors.length > 0) {
    filtered = filtered.filter((product) => {
      const productColors = product.colors as string[];
      return colors.some((color) =>
        productColors.some((pc) => pc.toLowerCase() === color.toLowerCase())
      );
    });
  }

  return filtered;
};

export const formatProductResponse = (product: any) => {
  return {
    ...product,
    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
  };
};

export const formatProductsResponse = (products: any[]) => {
  return products.map(formatProductResponse);
};

export const calculateDiscount = (price: number, discountPrice: number | null): number => {
  if (!discountPrice) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export const buildCategoryHierarchy = (categories: any[]): any[] => {
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  // Create a map of all categories
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Build the hierarchy
  categories.forEach((category) => {
    const cat = categoryMap.get(category.id);
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(cat);
      }
    } else {
      rootCategories.push(cat);
    }
  });

  return rootCategories;
};

export const getAllCategoryIds = async (categoryId: string, prisma: any): Promise<string[]> => {
  const ids = [categoryId];

  const getChildIds = async (parentId: string): Promise<void> => {
    const children = await prisma.category.findMany({
      where: { parentId },
      select: { id: true },
    });

    for (const child of children) {
      ids.push(child.id);
      await getChildIds(child.id);
    }
  };

  await getChildIds(categoryId);
  return ids;
};
