import React from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
// Tái sử dụng CSS từ trang danh sách sản phẩm áo
import styles from '../ProductListPage/ProductListPage.module.scss'; 
// Import danh sách sản phẩm quần
import { pantProducts } from '../../data/mockData';

const PantsListPage = () => {
  const pageTitle = "Quần";
  const products = pantProducts; // Lấy danh sách sản phẩm quần

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

export default PantsListPage;