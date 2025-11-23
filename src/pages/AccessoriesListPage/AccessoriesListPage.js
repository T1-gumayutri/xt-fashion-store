import React, { useState, useMemo } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './AccessoriesListPage.module.scss';
import { accessoryProducts } from '../../data/mockData'; //

// --- Imports MỚI ---
import PriceRangeSlider from '../../components/common/PriceRangeSlider/PriceRangeSlider';
import ColorFilter from '../../components/common/ColorFilter/ColorFilter';

// --- Hàm tiện ích: Lấy danh sách màu duy nhất ---
//
const getUniqueColors = (products) => {
    const colorMap = new Map();
    products.forEach(product => {
        product.inventory.forEach(item => {
            if (item.color && item.colorHex && !colorMap.has(item.color)) {
                colorMap.set(item.color, item.colorHex);
            }
        });
    });
    return Array.from(colorMap, ([name, hex]) => ({ name, hex }));
};
// ---------------------------------------------

// --- Tính toán giá trị Min/Max/Colors (dùng accessoryProducts) ---
const prices = accessoryProducts.map(p => p.price); //
const MIN_PRICE = prices.length > 0 ? Math.min(...prices) : 0;
const MAX_PRICE = prices.length > 0 ? Math.max(...prices) : 1000000;
const AVAILABLE_COLORS = getUniqueColors(accessoryProducts);
// -----------------------------------------------------------------

const AccessoriesListPage = () => {
    const [sortOrder, setSortOrder] = useState('default');
    
    // --- State cho bộ lọc ---
    const [priceFilter, setPriceFilter] = useState([MIN_PRICE, MAX_PRICE]);
    const [colorFilter, setColorFilter] = useState([]); // State MỚI

    // --- Hàm callback cho bộ lọc ---
    const handlePriceFilterChange = (newValue) => {
        setPriceFilter(newValue);
    };
    const handleColorFilterChange = (selectedColors) => { // Hàm MỚI
        setColorFilter(selectedColors);
    };

    // --- Cập nhật logic lọc và sắp xếp ---
    const sortedProducts = useMemo(() => {
        let products = [...accessoryProducts]; //

        // 1. Lọc theo giá
        products = products.filter(
            (product) =>
                product.price >= priceFilter[0] && product.price <= priceFilter[1]
        );

        // 2. Lọc theo màu (MỚI)
        if (colorFilter.length > 0) {
            products = products.filter(product =>
                product.inventory.some(item => colorFilter.includes(item.color)) //
            );
        }

        // 3. Sắp xếp (giữ nguyên)
        switch (sortOrder) { //
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                products.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }
        return products;
    }, [sortOrder, priceFilter, colorFilter]); // Thêm 'colorFilter'

    return (
        <PageLayout pageTitle="Phụ kiện">
            <div className={styles.container}>
                <div className={styles.toolbar}>
                    
                    {/* 1. Bộ lọc giá */}
                    <div className={styles.filterContainer}>
                        <PriceRangeSlider
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            onFilterChange={handlePriceFilterChange}
                        />
                    </div>

                    {/* 2. Bộ lọc màu (MỚI) */}
                    <div className={styles.colorFilterContainer}>
                        <ColorFilter
                            availableColors={AVAILABLE_COLORS}
                            onChange={handleColorFilterChange}
                        />
                    </div>

                    {/* 3. Số lượng sản phẩm & Sắp xếp */}
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
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {sortedProducts.length === 0 && (
                    <div className={styles.noResults}>
                        <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default AccessoriesListPage;