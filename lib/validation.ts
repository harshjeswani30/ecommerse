import { Season } from "@prisma/client";
import { ValidationError } from "./errors";

export const validateCategory = (data: any) => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Category name is required");
  }

  if (!data.slug || typeof data.slug !== "string" || data.slug.trim().length === 0) {
    errors.push("Category slug is required");
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
  }

  if (data.parentId && typeof data.parentId !== "string") {
    errors.push("Parent ID must be a valid string");
  }

  if (errors.length > 0) {
    throw new ValidationError("Category validation failed", errors);
  }

  return {
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    description: data.description?.trim() || null,
    parentId: data.parentId || null,
  };
};

export const validateProduct = (data: any) => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Product name is required");
  }

  if (!data.slug || typeof data.slug !== "string" || data.slug.trim().length === 0) {
    errors.push("Product slug is required");
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
  }

  if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
    errors.push("Product description is required");
  }

  if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
    errors.push("Price must be a positive number");
  }

  if (data.discountPrice && (isNaN(parseFloat(data.discountPrice)) || parseFloat(data.discountPrice) < 0)) {
    errors.push("Discount price must be a non-negative number");
  }

  if (data.discountPrice && parseFloat(data.discountPrice) >= parseFloat(data.price)) {
    errors.push("Discount price must be less than regular price");
  }

  if (!data.categoryId || typeof data.categoryId !== "string") {
    errors.push("Category ID is required");
  }

  if (!data.season || !Object.values(Season).includes(data.season)) {
    errors.push("Valid season is required (WINTER, SUMMER, SPRING, FALL, ALL)");
  }

  if (data.stock === undefined || isNaN(parseInt(data.stock)) || parseInt(data.stock) < 0) {
    errors.push("Stock must be a non-negative integer");
  }

  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    errors.push("At least one image URL is required");
  }

  if (!data.sizes || !Array.isArray(data.sizes) || data.sizes.length === 0) {
    errors.push("At least one size is required");
  }

  if (!data.colors || !Array.isArray(data.colors) || data.colors.length === 0) {
    errors.push("At least one color is required");
  }

  if (!data.fabric || typeof data.fabric !== "string" || data.fabric.trim().length === 0) {
    errors.push("Fabric information is required");
  }

  if (errors.length > 0) {
    throw new ValidationError("Product validation failed", errors);
  }

  return {
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    description: data.description.trim(),
    price: parseFloat(data.price),
    discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
    categoryId: data.categoryId,
    season: data.season,
    stock: parseInt(data.stock),
    images: data.images,
    sizes: data.sizes,
    colors: data.colors,
    fabric: data.fabric.trim(),
  };
};

export const validateStockUpdate = (data: any) => {
  const errors: string[] = [];

  if (!data.action || !["set", "add", "subtract"].includes(data.action)) {
    errors.push("Action must be 'set', 'add', or 'subtract'");
  }

  if (data.quantity === undefined || isNaN(parseInt(data.quantity)) || parseInt(data.quantity) < 0) {
    errors.push("Quantity must be a non-negative integer");
  }

  if (errors.length > 0) {
    throw new ValidationError("Stock update validation failed", errors);
  }

  return {
    action: data.action as "set" | "add" | "subtract",
    quantity: parseInt(data.quantity),
  };
};

export const sanitizeSearchQuery = (query: string): string => {
  return query.trim().replace(/[^\w\s-]/g, "");
};

export const validatePaginationParams = (page?: string, limit?: string) => {
  const pageNum = page ? parseInt(page) : 1;
  const limitNum = limit ? parseInt(limit) : 20;

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError("Page must be a positive integer");
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError("Limit must be between 1 and 100");
  }

  return { page: pageNum, limit: limitNum };
};
