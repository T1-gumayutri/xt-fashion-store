import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './SearchResultsPage.module.scss';
import productApi from '../../api/productApi'; 

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const query = useQuery();
  const searchTerm = query.get('q');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const params = { 
            keyword: searchTerm,
            limit: 100
        }; 
        
        const response = await productApi.getAll(params);
        
        let productList = [];
        
        if (response.products) {
            productList = response.products;
        } else if (response.data && response.data.products) {
            productList = response.data.products;
        }

        setProducts(productList);
        
      } catch (error) {
        console.error("Lỗi tìm kiếm sản phẩm:", error);
        setProducts([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  const pageTitle = `Kết quả cho "${searchTerm}"`;

  return (
    <PageLayout pageTitle={pageTitle}>
      <div className={styles.container}>
        
        {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                <h3>Đang tìm kiếm sản phẩm...</h3>
            </div>
        ) : (
            <>
                <h1 className={styles.pageTitle}>
                  {products.length > 0
                    ? `Tìm thấy ${products.length} sản phẩm cho "${searchTerm}"`
                    : `Không tìm thấy sản phẩm nào cho "${searchTerm}"`}
                </h1>

                {products.length > 0 && (
                  <div className={styles.productGrid}>
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
                
                {products.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <p>Vui lòng thử lại với từ khóa khác chung chung hơn.</p>
                    </div>
                )}
            </>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchResultsPage;