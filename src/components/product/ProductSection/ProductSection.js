import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductSection.module.scss';

const ProductSection = ({ title, mainPath, products, subCategories, activeFilter, onFilterChange }) => {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Link to={mainPath} className={styles.titleLink}>
          <h2 className={styles.title}>{title}</h2>
        </Link>
        <div className={styles.subCategoryNav}>
          {/* Nút Tất cả */}
          <button 
            className={`${styles.subCategoryLink} ${activeFilter === 'Tất cả' ? styles.active : ''}`}
            onClick={() => onFilterChange('Tất cả')}
          >
            Tất cả
          </button>
          {/* Các nút danh mục con */}
          {subCategories.map((cat, index) => (
            <button 
              key={index} 
              className={`${styles.subCategoryLink} ${activeFilter === cat.title ? styles.active : ''}`}
              onClick={() => onFilterChange(cat.title)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className={styles.viewAllContainer}>
        <Link to={mainPath} className={styles.viewAllLink}>
          Xem tất cả sản phẩm {title}
        </Link>
      </div>
    </section>
  );
};

export default ProductSection;