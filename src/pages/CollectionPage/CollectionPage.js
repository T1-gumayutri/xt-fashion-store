import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './CollectionPage.module.scss';
import productApi from '../../api/productApi';
import { slugify } from '../../helpers/slugify';

// Import các component bộ lọc
import PriceRangeSlider from '../../components/common/PriceRangeSlider/PriceRangeSlider';
import ColorFilter from '../../components/common/ColorFilter/ColorFilter';

const CollectionPage = () => {
  const { subCategory: subCategorySlug } = useParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho bộ lọc và sắp xếp
  const [sortOrder, setSortOrder] = useState('default');
  const [priceFilter, setPriceFilter] = useState([0, 10000000]);
  const [colorFilter, setColorFilter] = useState([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAll({ limit: 500 }); 
        setProducts(response.data.products);
      } catch (error) {
        console.log("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [subCategorySlug]);

  const baseProducts = useMemo(() => {
    if (!products.length) return [];
    return products.filter(p => {
      return p.subCategory && slugify(p.subCategory) === subCategorySlug;
    });
  }, [products, subCategorySlug]);

  const { minPrice, maxPrice } = useMemo(() => {
      if (baseProducts.length === 0) return { minPrice: 0, maxPrice: 1000000 };
      const prices = baseProducts.map(p => p.price);
      return {
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices)
      };
  }, [baseProducts]);

  useEffect(() => {
      setPriceFilter([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const availableColors = useMemo(() => {
      const colorMap = new Map();
      baseProducts.forEach(product => {
          if (product.variants) {
              product.variants.forEach(item => {
                  if (item.color && item.colorHex && !colorMap.has(item.color)) {
                      colorMap.set(item.color, item.colorHex);
                  }
              });
          }
      });
      return Array.from(colorMap, ([name, hex]) => ({ name, hex }));
  }, [baseProducts]);

  const finalDisplayProducts = useMemo(() => {
      let result = [...baseProducts];

      // 1. Lọc giá
      result = result.filter(
          (p) => p.price >= priceFilter[0] && p.price <= priceFilter[1]
      );

      // 2. Lọc màu
      if (colorFilter.length > 0) {
          result = result.filter(p =>
              p.variants && p.variants.some(item => colorFilter.includes(item.color))
          );
      }

      // 3. Sắp xếp
      switch (sortOrder) {
          case 'price-asc':
              result.sort((a, b) => a.price - b.price);
              break;
          case 'price-desc':
              result.sort((a, b) => b.price - a.price);
              break;
          case 'name-asc':
              result.sort((a, b) => a.productName.localeCompare(b.productName));
              break;
          case 'name-desc':
              result.sort((a, b) => b.productName.localeCompare(a.productName));
              break;
          default:
              break;
      }
      return result;
  }, [baseProducts, sortOrder, priceFilter, colorFilter]);

  const handlePriceFilterChange = (newValue) => {
      setPriceFilter(newValue);
  };
  const handleColorFilterChange = (selectedColors) => {
      setColorFilter(selectedColors);
  };

  const pageTitle = baseProducts.length > 0 
    ? baseProducts[0].subCategory
    : subCategorySlug.replace(/-/g, ' ');

  return (
    <PageLayout pageTitle={pageTitle}>
      <div className={styles.container}>
        {loading ? (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Đang tải bộ sưu tập...</p>
            </div>
        ) : (
            <>
                <h1 className={styles.pageTitle} style={{textTransform: 'capitalize'}}>{pageTitle}</h1>

                <div className={styles.layoutWrapper}>
                    {/* --- CỘT TRÁI: SIDEBAR BỘ LỌC --- */}
                    <aside className={styles.sidebar}>
                        <div className={styles.filterGroup}>
                            
                            <PriceRangeSlider
                                min={minPrice}
                                max={maxPrice}
                                value={priceFilter} 
                                onFilterChange={handlePriceFilterChange}
                            />
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.filterGroup}>
                            
                            <ColorFilter
                                availableColors={availableColors}
                                onChange={handleColorFilterChange}
                            />
                        </div>
                    </aside>

                    {/* --- CỘT PHẢI: NỘI DUNG CHÍNH --- */}
                    <main className={styles.mainContent}>
                        {/* Thanh công cụ: Số lượng + Sắp xếp */}
                        <div className={styles.topBar}>
                            <div className={styles.productCount}>
                                Tìm thấy <b>{finalDisplayProducts.length}</b> sản phẩm
                            </div>
                            <div className={styles.sortOptions}>
                                <label htmlFor="sort">Sắp xếp: </label>
                                <select 
                                    id="sort" 
                                    value={sortOrder} 
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option value="default">Mặc định</option>
                                    <option value="price-asc">Giá: Tăng dần</option>
                                    <option value="price-desc">Giá: Giảm dần</option>
                                    <option value="name-asc">Tên: A-Z</option>
                                    <option value="name-desc">Tên: Z-A</option>
                                </select>
                            </div>
                        </div>

                        {/* Lưới sản phẩm */}
                        {finalDisplayProducts.length > 0 ? (
                            <div className={styles.productGrid}>
                                {finalDisplayProducts.map((product) => (
                                    <ProductCard 
                                        key={product._id || product.id} 
                                        product={product} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noResults}>
                                <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                            </div>
                        )}
                    </main>
                </div>
            </>
        )}
      </div>
    </PageLayout>
  );
};

export default CollectionPage;