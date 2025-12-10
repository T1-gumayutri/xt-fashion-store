import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import HeroBanner from '../../components/homepage/HeroBanner/HeroBanner';
import BrandShowcase from '../../components/homepage/BrandShowcase/BrandShowcase';
import ProductSection from '../../components/product/ProductSection/ProductSection';

import productApi from '../../api/productApi';

const HomePage = () => {
  const [shirtProducts, setShirtProducts] = useState([]);
  const [pantProducts, setPantProducts] = useState([]);
  const [accessoryProducts, setAccessoryProducts] = useState([]);

  const [shirtFilter, setShirtFilter] = useState('Tất cả');
  const [pantFilter, setPantFilter] = useState('Tất cả');
  const [accessoryFilter, setAccessoryFilter] = useState('Tất cả');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {

        const [resShirts, resPants, resAccessories] = await Promise.all([
          productApi.getAll({ category: 'ao-xuan-he', limit: 100 }),
          productApi.getAll({ category: 'quan', limit: 100 }),
          productApi.getAll({ category: 'phu-kien', limit: 100 })
        ]);

        setShirtProducts(resShirts.data.products);
        setPantProducts(resPants.data.products);
        setAccessoryProducts(resAccessories.data.products);

      } catch (error) {
        console.log("Lỗi tải trang chủ:", error);
      }
    };

    fetchHomeData();
  }, []);

  const filteredShirts = useMemo(() => {
    if (shirtFilter === 'Tất cả') return shirtProducts;
    return shirtProducts.filter(p => p.subCategory === shirtFilter);
  }, [shirtFilter, shirtProducts]);

  const filteredPants = useMemo(() => {
    if (pantFilter === 'Tất cả') return pantProducts;
    return pantProducts.filter(p => p.subCategory === pantFilter);
  }, [pantFilter, pantProducts]);

  const filteredAccessories = useMemo(() => {
    if (accessoryFilter === 'Tất cả') return accessoryProducts;
    return accessoryProducts.filter(p => p.subCategory === accessoryFilter);
  }, [accessoryFilter, accessoryProducts]);

  const shirtSubCategories = [ { title: 'Áo Sơ Mi Dài Tay' }, { title: 'Áo Sơ Mi Ngắn Tay' }, { title: 'Áo Polo' }, { title: 'Áo Thun' }, { title: 'Áo Khoác' }];
  const pantSubCategories = [ { title: 'Quần Dài' }, { title: 'Quần Short' }];
  const accessorySubCategories = [ { title: 'Bóp Tay / Ví' }, { title: 'Giày' }, { title: 'Thắt Lưng' }, { title: 'Cà Vạt' }];

  return (
    <div>
      <Header />
      <main>
        <HeroBanner />
        
        <ProductSection 
          title="Áo Xuân Hè"
          mainPath="/ao-xuan-he"
          products={filteredShirts.slice(0, 8)} 
          subCategories={shirtSubCategories}
          activeFilter={shirtFilter} 
          onFilterChange={setShirtFilter} 
        />

        <ProductSection 
          title="Quần Nam" 
          mainPath="/quan"
          products={filteredPants.slice(0, 8)}
          subCategories={pantSubCategories} 
          activeFilter={pantFilter}
          onFilterChange={setPantFilter}
        />

        <ProductSection 
          title="Phụ Kiện" 
          mainPath="/phu-kien"
          products={filteredAccessories.slice(0, 8)}
          subCategories={accessorySubCategories} 
          activeFilter={accessoryFilter}
          onFilterChange={setAccessoryFilter}
        />
        
        <BrandShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;