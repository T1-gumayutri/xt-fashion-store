import React from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './ProductListPage.module.scss';
// Chúng ta sẽ lấy tất cả sản phẩm áo từ file mock data
import { shirtProducts } from '../../data/mockData';

const ProductListPage = () => {
  const pageTitle = "Áo Xuân Hè";
  const products = shirtProducts; // Lấy danh sách sản phẩm áo

  return (
    <PageLayout pageTitle={pageTitle}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductListPage;