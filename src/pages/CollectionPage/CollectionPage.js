import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './CollectionPage.module.scss';

import productApi from '../../api/productApi';
import { slugify } from '../../helpers/slugify';

const CollectionPage = () => {
  const { subCategory: subCategorySlug } = useParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter(p => {
      return p.subCategory && slugify(p.subCategory) === subCategorySlug;
    });
  }, [products, subCategorySlug]);

  const pageTitle = filteredProducts.length > 0 
    ? filteredProducts[0].subCategory
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
              
                {filteredProducts.length > 0 ? (
                  <div className={styles.productGrid}>
                    {filteredProducts.map((product) => (
                      <ProductCard 
                        key={product._id || product.id} 
                        product={product} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noProducts}>
                      <p>Không tìm thấy sản phẩm nào trong danh mục này.</p>
                  </div>
                )}
            </>
        )}
      </div>
    </PageLayout>
  );
};

export default CollectionPage;