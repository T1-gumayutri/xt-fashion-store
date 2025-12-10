import React, { useState, useEffect, useMemo } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './PantsListPage.module.scss';

import productApi from '../../api/productApi';

import PriceRangeSlider from '../../components/common/PriceRangeSlider/PriceRangeSlider';
import ColorFilter from '../../components/common/ColorFilter/ColorFilter';

const PantsListPage = () => {

    const [products, setProducts] = useState([]); 
    const [loading, setLoading] = useState(true);

    const [sortOrder, setSortOrder] = useState('default');
    const [priceFilter, setPriceFilter] = useState([0, 10000000]); 
    const [colorFilter, setColorFilter] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await productApi.getAll({ category: 'quan', limit: 100 });
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

        result = result.filter(
            (p) => p.price >= priceFilter[0] && p.price <= priceFilter[1]
        );

        if (colorFilter.length > 0) {
            result = result.filter(p =>
                p.variants && p.variants.some(item => colorFilter.includes(item.color))
            );
        }
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
        <PageLayout pageTitle="Quần Nam">
            <div className={styles.container}>
                
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>Đang tải sản phẩm...</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.toolbar}>
                            <div className={styles.filterContainer}>
                                <PriceRangeSlider
                                    min={minPrice}
                                    max={maxPrice}
                                    value={priceFilter} 
                                    onFilterChange={handlePriceFilterChange}
                                />
                            </div>

                            <div className={styles.colorFilterContainer}>
                                <ColorFilter
                                    availableColors={availableColors}
                                    onChange={handleColorFilterChange}
                                />
                            </div>

                            <div className={styles.controlsContainer}>
                                <div className={styles.productCount}>
                                    Hiển thị {sortedProducts.length} sản phẩm
                                </div>
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
                        </div>

                        <div className={styles.productGrid}>
                            {sortedProducts.map((product) => (
                                <ProductCard key={product._id} product={product}/>
                            ))}
                        </div>

                        {sortedProducts.length === 0 && (
                            <div className={styles.noResults}>
                                <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageLayout>
    );
};

export default PantsListPage;