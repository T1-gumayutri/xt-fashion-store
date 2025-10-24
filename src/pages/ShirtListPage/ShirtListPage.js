import React, { useState, useMemo } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './ShirtListPage.module.scss';
// Chỉ import dữ liệu áo
import { shirtProducts } from '../../data/mockData'; 

const ShirtListPage = () => {
    const [sortOrder, setSortOrder] = useState('default');

    // Logic sắp xếp giờ sẽ hoạt động trên shirtProducts
    const sortedProducts = useMemo(() => {
        // Tạo bản sao của mảng shirtProducts để sắp xếp
        const sorted = [...shirtProducts]; 
        switch (sortOrder) {
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // Trả về mảng gốc nếu là 'default'
                break;
        }
        return sorted;
    }, [sortOrder]);

    // Đổi tiêu đề trang thành "Áo"
    return (
        <PageLayout pageTitle="Áo xuân hè">
            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <div className={styles.sortOptions}>
                        <label htmlFor="sort">Sắp xếp theo: </label>
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

                <div className={styles.productGrid}>
                    {sortedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default ShirtListPage;