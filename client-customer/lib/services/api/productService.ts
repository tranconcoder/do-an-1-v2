import apiClient from '../axiosInstance'; // apiClient is our axiosInstance

// Define a type for the product data if you have one, e.g.:
// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   // ...other properties
// }

// Example type for product creation data (could be different from Product type)
// interface CreateProductDto {
//   name: string;
//   price: number;
//   // ...other properties
// }

const productService = {
  /**
   * Fetches all products.
   * @returns {Promise<any>} A promise that resolves to the list of products.
   */
  getAllProducts: async (params?: any) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data; // Usually, the actual data is in response.data
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error; // Re-throw to allow a component to handle it
    }
  },

  /**
   * Fetches a single product by its ID.
   * @param {string} productId - The ID of the product to fetch.
   * @returns {Promise<any>} A promise that resolves to the product data.
   */
  getProductById: async (productId: string) => {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      return response.data;
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

  // You can add more product-related API calls here, e.g.:
  // searchProducts: async (query: string) => { ... }
  // getProductsByCategory: async (categoryId: string) => { ... }
};

export default productService; 