import React, { useState, useEffect } from 'react';
// FIX 1: Import 'Slider' (export mặc định) thay vì { Range }
import Slider from 'rc-slider'; 
import 'rc-slider/assets/index.css'; // Import CSS bắt buộc
import styles from './PriceRangeSlider.module.scss';

// Hàm tiện ích để định dạng tiền tệ
const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const PriceRangeSlider = ({ min, max, onFilterChange }) => {
  const [value, setValue] = useState([min, max]);

  useEffect(() => {
    setValue([min, max]);
  }, [min, max]);

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  const handleAfterChange = (newValue) => {
    onFilterChange(newValue);
  };

  return (
    <div className={styles.priceSliderContainer}>
      <h4>Lọc theo giá:</h4>
      <div className={styles.priceLabels}>
        <span>{formatPrice(value[0])}</span>
        <span>{formatPrice(value[1])}</span>
      </div>
      
      {/* FIX 2: Dùng component <Slider>
        FIX 3: Thêm prop 'range' để biến nó thành thanh trượt khoảng giá
      */}
      <Slider
        range 
        className={styles.priceSlider}
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        onAfterChange={handleAfterChange}
        step={50000} 
        allowCross={false} 
      />
    </div>
  );
};

export default PriceRangeSlider;