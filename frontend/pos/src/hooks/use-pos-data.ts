import { useEffect, useRef } from 'react';
import { usePOSStore } from '@/stores/pos';
import { categoryService } from '@/lib/services/category-service';
import { productService } from '@/lib/services/product-service';

export function usePOSData() {
  const {
    categories,
    selectedCategoryId,
    products,
    allProducts,
    isLoadingCategories,
    isLoadingProducts,
    setCategories,
    setSelectedCategoryId,
    setProducts,
    setAllProducts,
    setIsLoadingCategories,
    setIsLoadingProducts,
  } = usePOSStore();

  // Cache để tránh fetch lại dữ liệu đã có
  const categoriesLoaded = useRef(false);
  const allProductsLoaded = useRef(false);
  const categoryProductsCache = useRef<Map<number, boolean>>(new Map());

  // Load categories với first product image
  useEffect(() => {
    if (categoriesLoaded.current || categories.length > 0) return;

    const loadCategoriesWithImages = async () => {
      try {
        setIsLoadingCategories(true);
        const result = await categoryService.getAll({ limit: 100 });
        
        // Load first product image for each category
        const categoriesWithImages = await Promise.all(
          result.data.map(async (category) => {
            try {
              const productsResult = await productService.getByCategory(category.category_id, { limit: 1 });
              const firstProduct = productsResult.data[0];
              return {
                ...category,
                firstProductImage: firstProduct?.image_path
              };
            } catch (error) {
              return category;
            }
          })
        );
        
        setCategories(categoriesWithImages);
        categoriesLoaded.current = true;
        
        // Set first category as selected if none selected
        if (!selectedCategoryId && categoriesWithImages.length > 0) {
          setSelectedCategoryId(categoriesWithImages[0].category_id);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategoriesWithImages();
  }, [categories.length, selectedCategoryId, setCategories, setSelectedCategoryId, setIsLoadingCategories]);

  // Load all products once
  useEffect(() => {
    if (allProductsLoaded.current || allProducts.length > 0) return;

    const loadAllProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const result = await productService.getAll({ limit: 100 });
        setAllProducts(result.data);
        allProductsLoaded.current = true;
      } catch (error) {
        console.error('Lỗi khi tải tất cả sản phẩm:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadAllProducts();
  }, [allProducts.length, setAllProducts, setIsLoadingProducts]);

  // Load products by category (with cache)
  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts(allProducts);
      return;
    }

    // Check cache first
    if (categoryProductsCache.current.has(selectedCategoryId)) {
      const categoryProducts = allProducts.filter(p => p.category_id === selectedCategoryId);
      setProducts(categoryProducts);
      return;
    }

    const loadProductsByCategory = async () => {
      try {
        setIsLoadingProducts(true);
        const result = await productService.getByCategory(selectedCategoryId, { limit: 100 });
        setProducts(result.data);
        
        // Cache this category
        categoryProductsCache.current.set(selectedCategoryId, true);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm theo danh mục:', error);
        // Fallback to filtering from allProducts
        const categoryProducts = allProducts.filter(p => p.category_id === selectedCategoryId);
        setProducts(categoryProducts);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProductsByCategory();
  }, [selectedCategoryId, allProducts, setProducts, setIsLoadingProducts]);

  return {
    categories,
    products,
    allProducts,
    isLoadingCategories,
    isLoadingProducts,
  };
} 