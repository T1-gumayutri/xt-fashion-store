import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import HeroBanner from '../../components/homepage/HeroBanner/HeroBanner';
import BrandShowcase from '../../components/homepage/BrandShowcase/BrandShowcase';
import ProductSection from '../../components/product/ProductSection/ProductSection';
import { shirtProducts, pantProducts, accessoryProducts } from '../../data/mockData';

const HomePage = () => {
  // State để lưu bộ lọc cho mỗi mục
  const [shirtFilter, setShirtFilter] = useState('Tất cả');
  const [pantFilter, setPantFilter] = useState('Tất cả');
  const [accessoryFilter, setAccessoryFilter] = useState('Tất cả');

  // Logic lọc sản phẩm áo
  const filteredShirts = useMemo(() => {
    if (shirtFilter === 'Tất cả') {
      return shirtProducts;
    }
    return shirtProducts.filter(p => p.subCategory === shirtFilter);
  }, [shirtFilter]);

  // Logic lọc sản phẩm quần
  const filteredPants = useMemo(() => {
    if (pantFilter === 'Tất cả') {
      return pantProducts;
    }
    return pantProducts.filter(p => p.subCategory === pantFilter);
  }, [pantFilter]);

  // Logic lọc sản phẩm phụ kiện
  const filteredAccessories = useMemo(() => {
    if (accessoryFilter === 'Tất cả') {
      return accessoryProducts;
    }
    return accessoryProducts.filter(p => p.subCategory === accessoryFilter);
  }, [accessoryFilter]);

  // Dữ liệu cho các mục con (giữ nguyên từ file bạn cung cấp)
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
          products={filteredShirts.slice(0, 8)} // Hiển thị sản phẩm đã lọc
          subCategories={shirtSubCategories}
          activeFilter={shirtFilter} // Truyền bộ lọc đang active
          onFilterChange={setShirtFilter} // Truyền hàm để thay đổi bộ lọc
        />

        <ProductSection 
          title="Quần" 
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