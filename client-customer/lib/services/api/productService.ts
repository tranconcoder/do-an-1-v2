import apiClient from '../axiosInstance'; // apiClient is our axiosInstance
import { BACKEND_API_URL } from '../server.config'; // For potential direct image URLs if not using mediaService
import { Category } from './categoryService';

// Define a type for the product data if you have one, e.g.:
// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   // ...other properties
// }

// Define Shop interface (based on previous ProductShop)
export interface ShopReference {
  _id: string; // Assuming shop ID is a string
  shop_name: string;
  shop_logo: string; // Media ID for the logo
}

// Define ProductDetail interface
export interface ProductAttribute {
  k: string; // Key (e.g., "Brand", "Color")
  v: string; // Value (e.g., "Apple", "Red")
  u?: string; // Unit (e.g., "GB") - optional
}

export interface ProductDetail {
  _id: string; // Changed from id: number to _id: string for MongoDB
  product_name: string;
  product_description: string;
  product_price: number;
  product_thumb: string; // Media ID for thumbnail
  product_images: string[]; // Array of media IDs for other images
  product_quantity: number; // Stock
  shop: ShopReference; // Embedded shop information
  product_attributes: ProductAttribute[];
  product_ratingsAverage?: number; // Optional
  sold_count?: number; // Added
  product_category?: string; // Category ID, added
  isNew?: boolean; // From previous Product interface
  salePrice?: number; // Optional, from previous Product interface
  discount?: number;  // Optional, from previous Product interface
  // Add other fields as necessary, e.g., variations, specifications
}

// Example type for product creation data (could be different from Product type)
// interface CreateProductDto {
//   name: string;
//   price: number;
//   // ...other properties
// }

// New interface for SKU-based product detail response
export interface ProductSkuDetail {
  _id: string; // SPU ID
  product_name: string;
  product_quantity: number;
  product_description: string;
  product_category: string;
  product_shop: string; // Shop ID (might need to be expanded)
  product_rating_avg?: number;
  product_slug: string;
  product_thumb: string; // Media ID for SPU
  product_images: string[]; // Media IDs for SPU
  product_attributes: ProductAttribute[];
  product_variations: Array<{
    variation_name: string;
    variation_values: string[];
    _id: string;
  }>;
  shop?: ShopReference; // Expanded shop information if available
  category?: Category[]; // Category information from lookup
  sku: {
    _id: string; // SKU ID
    sku_product: string; // SPU ID (links back to parent SPU)
    sku_price: number;
    sku_stock: number;
    sku_thumb: string; // Media ID for this specific SKU
    sku_images: string[]; // Media IDs for this specific SKU
    sku_value: { key: string; value: string }[];
  };
  sold_count?: number;
  isNew?: boolean;
  salePrice?: number;
  discount?: number;
}

// New interface for products from /sku list
export interface ProductSku {
  _id: string; // SPU ID
  product_name: string;
  product_quantity: number; // Overall SPU quantity. SKU stock is separate.
  product_description: string;
  product_category: string; // Category ID
  product_shop: string; // Shop ID
  product_rating_avg?: number;
  product_slug: string;
  product_thumb: string; // Media ID for SPU
  product_images: string[]; // Media IDs for SPU
  sku: {
    _id: string; // SKU ID
    sku_product: string; // SPU ID (links back to parent SPU)
    sku_price: number;
    sku_stock: number;
    sku_thumb: string; // Media ID for this specific SKU
    sku_images: string[]; // Media IDs for this specific SKU
    sku_value: { key: string; value: string }[];
  };
  sold_count?: number;
}

const productService = {
  async getAllProducts(): Promise<ProductSku[]> {
    try {
      const response = await apiClient.get('/sku');
      // console.log("getAllProducts response:", response.data.metadata);
      return response.data.metadata || []; // Ensure it returns an array even if metadata is null/undefined
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw error;
    }
  },

  /**
   * Fetches a single product by its ID.
   * @param {string} productId - The ID of the product to fetch.
   * @returns {Promise<any>} A promise that resolves to the product data.
   */
  getProductById: async (productId: string): Promise<ProductDetail> => {
    try {
      // The endpoint is often /spu/detail/:id for public product details
      const response = await apiClient.get(`/spu/detail/${productId}`);
      // Assuming the actual product data is nested under metadata.product
      if (response.data && response.data.metadata && response.data.metadata.product) {
        return response.data.metadata.product as ProductDetail;
      } else if (response.data && response.data.metadata) {
        // Fallback if product is directly under metadata
        return response.data.metadata as ProductDetail;
      }
      // If the structure is just response.data, uncomment below and adjust
      // return response.data as ProductDetail;
      throw new Error("Product data not found in the expected format");
    } catch (error) {
      console.error(`Error fetching product with ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new product.
   * @param {any} productData - The data for the new product. Use a specific DTO type if available.
   * @returns {Promise<any>} A promise that resolves to the created product data.
   */
  createProduct: async (productData: any /* CreateProductDto */) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Updates an existing product.
   * @param {string} productId - The ID of the product to update.
   * @param {any} productData - The updated data for the product. Use a specific DTO type if available.
   * @returns {Promise<any>} A promise that resolves to the updated product data.
   */
  updateProduct: async (productId: string, productData: any /* Partial<Product> or specific DTO */) => {
    try {
      const response = await apiClient.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product with ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a product by its ID.
   * @param {string} productId - The ID of the product to delete.
   * @returns {Promise<void>} A promise that resolves when the product is deleted.
   */
  deleteProduct: async (productId: string) => {
    try {
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data; // Or just return nothing if the API returns 204 No Content
    } catch (error) {
      console.error(`Error deleting product with ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches a single SKU by its ID.
   * @param {string} skuId - The ID of the SKU to fetch.
   * @returns {Promise<ProductSkuDetail>} A promise that resolves to the SKU data.
   */
  getSkuById: async (skuId: string): Promise<ProductSkuDetail> => {
    try {
      const response = await apiClient.get(`/sku/id/${skuId}`);
      if (response.data && response.data.metadata && response.data.metadata.length > 0) {
        const skuData = response.data.metadata[0];
        const productData = skuData.spu_select;
        
        // Transform API response to match ProductSkuDetail interface
        const transformedData: ProductSkuDetail = {
          _id: productData._id, // SPU ID
          product_name: productData.product_name,
          product_quantity: productData.product_quantity || 0,
          product_description: productData.product_description,
          product_category: productData.product_category,
          product_shop: productData.product_shop,
          product_rating_avg: productData.product_rating_avg,
          product_slug: productData.product_slug,
          product_thumb: productData.product_thumb,
          product_images: productData.product_images || [],
          product_attributes: productData.product_attributes || [],
          product_variations: productData.product_variations || [],
          shop: productData.shop,
          category: skuData.category || [], // Include category data from backend lookup
          sku: {
            _id: skuData._id, // SKU ID
            sku_product: skuData.sku_product,
            sku_price: skuData.sku_price,
            sku_stock: skuData.sku_stock,
            sku_thumb: skuData.sku_thumb,
            sku_images: skuData.sku_images || [],
            sku_value: skuData.sku_value || []
          },
          sold_count: productData.product_sold || productData.sold_count
        };
        
        return transformedData;
      }
      throw new Error("SKU data not found in the expected format");
    } catch (error) {
      console.error(`Error fetching SKU with ID ${skuId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches SKUs by category ID.
   * @param {string} categoryId - The ID of the category.
   * @param {number} limit - The maximum number of SKUs to fetch.
   * @returns {Promise<ProductSku[]>} A promise that resolves to the SKUs data.
   */
  getSkusByCategory: async (categoryId: string, limit: number = 8): Promise<ProductSku[]> => {
    try {
      const response = await apiClient.get(`/sku?category=${categoryId}&limit=${limit}`);
      return response.data.metadata || [];
    } catch (error) {
      console.error(`Error fetching SKUs for category ${categoryId}:`, error);
      throw error;
    }
  },


};

export default productService;