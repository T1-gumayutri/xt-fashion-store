import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './SearchResultsPage.module.scss';
import { shirtProducts, pantProducts, accessoryProducts } from '../../data/mockData';

const allProducts = [...shirtProducts, ...pantProducts, ...accessoryProducts];

// Hàm để lấy query parameter từ URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const query = useQuery();
  const searchTerm = query.get('q');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const pageTitle = `Kết quả cho "${searchTerm}"`;

  return (
    <PageLayout pageTitle={pageTitle}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          {filteredProducts.length > 0
            ? `Tìm thấy ${filteredProducts.length} sản phẩm cho "${searchTerm}"`
            : `Không tìm thấy sản phẩm nào cho "${searchTerm}"`}
        </h1>

        {filteredProducts.length > 0 && (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchResultsPage;