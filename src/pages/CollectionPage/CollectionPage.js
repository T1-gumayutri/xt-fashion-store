import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './CollectionPage.module.scss';
import { shirtProducts, pantProducts, accessoryProducts } from '../../data/mockData';
import { slugify } from '../../helpers/slugify'; // <-- 1. IMPORT HÀM MỚI

const allProducts = [...shirtProducts, ...pantProducts, ...accessoryProducts];

const CollectionPage = () => {
  const { subCategory: subCategorySlug } = useParams(); // Đổi tên để rõ ràng hơn
  
  // 2. LỌC SẢN PHẨM BẰNG CÁCH SO SÁNH SLUG
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => slugify(p.subCategory) === subCategorySlug);
  }, [subCategorySlug]);

  // 3. LẤY TÊN TRANG TỪ SẢN PHẨM ĐẦU TIÊN TÌM THẤY
  const pageTitle = filteredProducts.length > 0 
    ? filteredProducts[0].subCategory 
    : subCategorySlug.replace(/-/g, ' '); // Fallback title

  return (
    <PageLayout pageTitle={pageTitle}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        
        {filteredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className={styles.noProducts}>Không tìm thấy sản phẩm nào.</p>
        )}
      </div>
    </PageLayout>
  );
};

export default CollectionPage;