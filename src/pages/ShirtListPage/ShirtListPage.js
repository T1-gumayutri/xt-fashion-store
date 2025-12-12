import React, { useState, useEffect, useMemo } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './ShirtListPage.module.scss';
 
import productApi from '../../api/productApi';

import PriceRangeSlider from '../../components/common/PriceRangeSlider/PriceRangeSlider';
import ColorFilter from '../../components/common/ColorFilter/ColorFilter';

const ShirtListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sortOrder, setSortOrder] = useState('default');
    const [priceFilter, setPriceFilter] = useState([0, 10000000]);
    const [colorFilter, setColorFilter] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await productApi.getAll({ category: 'ao-xuan-he', limit: 100 });
                setProducts(response.data.products);
            } catch (error) {
                console.log("Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const { minPrice, maxPrice } = useMemo(() => {
        if (products.length === 0) return { minPrice: 0, maxPrice: 1000000 };
        const prices = products.map(p => p.price);
        return {
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices)
        };
    }, [products]);

    useEffect(() => {
        setPriceFilter([minPrice, maxPrice]);
    }, [minPrice, maxPrice]);

    const availableColors = useMemo(() => {
        const colorMap = new Map();
        products.forEach(product => {
            if (product.variants) {
                product.variants.forEach(item => {
                    if (item.color && item.colorHex && !colorMap.has(item.color)) {
                        colorMap.set(item.color, item.colorHex);
                    }
                });
            }
        });
        return Array.from(colorMap, ([name, hex]) => ({ name, hex }));
    }, [products]);

    const sortedProducts = useMemo(() => {
        let result = [...products];
        
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
    }, [products, sortOrder, priceFilter, colorFilter]);

    const handlePriceFilterChange = (newValue) => {
        setPriceFilter(newValue);
    };
    const handleColorFilterChange = (selectedColors) => {
        setColorFilter(selectedColors);
    };

    return (
        <PageLayout pageTitle="Áo xuân hè">
            <div className={styles.container}>
                {loading ? (
                     <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>Đang tải sản phẩm...</p>
                </div>
                ) : (
                    <>
                        <h1 className={styles.pageTitle}>Áo Xuân Hè</h1>
                        <div className={styles.layoutWrapper}>
                            {/* --- SIDEBAR BÊN TRÁI --- */}
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

                            {/* --- NỘI DUNG CHÍNH BÊN PHẢI --- */}
                            <main className={styles.mainContent}>
                                <div className={styles.topBar}>
                                    <div className={styles.productCount}>
                                        Hiển thị <b>{sortedProducts.length}</b> sản phẩm
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

                                {sortedProducts.length > 0 ? (
                                    <div className={styles.productGrid}>
                                        {sortedProducts.map((product) => (
                                            <ProductCard key={product._id} product={product}/>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.noResults}>
                                        <p>Không tìm thấy sản phẩm nào phù hợp.</p>
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

export default ShirtListPage;