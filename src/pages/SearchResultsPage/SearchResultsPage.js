import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './SearchResultsPage.module.scss';
import productApi from '../../api/productApi';

// Hàm để lấy query parameter từ URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const query = useQuery();
  const searchTerm = query.get('q');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm || searchTerm.trim() === '') {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Gọi API với các params phổ biến - backend sẽ chọn param phù hợp
        // Thử nhiều tham số để đảm bảo tương thích với backend
        // Thêm limit lớn để lấy tất cả kết quả
        const response = await productApi.getAll({ 
          keyword: searchTerm,    // Thử param 'keyword'
          search: searchTerm,     // Thử param 'search'
          q: searchTerm,          // Thử param 'q'
          name: searchTerm,       // Thử param 'name'
          limit: 1000,            // Lấy tối đa 1000 sản phẩm
          page: 1                 // Trang đầu tiên
        });
        
        // Lấy danh sách products từ response
        const productsList = response.data.products || response.data || [];
        
        // Lọc thêm ở client-side để đảm bảo kết quả chính xác
        const filtered = productsList.filter(product => {
          const productName = (product.productName || product.name || '').toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          return productName.includes(searchLower);
        });
        
        setProducts(filtered);
        
      } catch (err) {
        console.error('Lỗi tìm kiếm:', err);
        setError('Có lỗi xảy ra khi tìm kiếm sản phẩm');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  const pageTitle = searchTerm ? `Kết quả cho "${searchTerm}"` : 'Tìm kiếm sản phẩm';

  return (
    <PageLayout pageTitle={pageTitle}>
      <div className={styles.container}>
        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Đang tìm kiếm...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <h1 className={styles.pageTitle}>
              {products.length > 0
                ? `Tìm thấy ${products.length} sản phẩm cho "${searchTerm}"`
                : searchTerm 
                  ? `Không tìm thấy sản phẩm nào cho "${searchTerm}"`
                  : 'Vui lòng nhập từ khóa tìm kiếm'}
            </h1>

            {products.length > 0 ? (
              <div className={styles.productGrid}>
                {products.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            ) : searchTerm ? (
              <div className={styles.noResultsContainer}>
                <div className={styles.noResultsIcon}>🔍</div>
                <p className={styles.noResultsText}>
                  Không tìm thấy sản phẩm nào phù hợp
                </p>
                <p className={styles.noResultsSubtext}>
                  Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả
                </p>
              </div>
            ) : (
              <div className={styles.emptySearchContainer}>
                <div className={styles.emptyIcon}>🔎</div>
                <p>Nhập từ khóa để tìm kiếm sản phẩm</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchResultsPage;