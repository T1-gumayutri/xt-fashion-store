import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styles from './PriceRangeSlider.module.scss';

const PriceRangeSlider = ({ min, max, onFilterChange }) => {
  // State lưu giá trị của Slider (luôn là số)
  const [sliderValue, setSliderValue] = useState([min, max]);
  
  // State lưu giá trị hiển thị trong ô input (có thể là chuỗi khi đang gõ)
  const [inputValue, setInputValue] = useState([min, max]);

  useEffect(() => {
    setSliderValue([min, max]);
    setInputValue([min, max]);
  }, [min, max]);

  // Xử lý khi kéo thanh trượt
  const handleSliderChange = (newValue) => {
    setSliderValue(newValue);
    setInputValue(newValue); // Đồng bộ giá trị vào ô input ngay lập tức
  };

  // Xử lý khi thả tay khỏi thanh trượt (kết thúc kéo)
  const handleSliderAfterChange = (newValue) => {
    onFilterChange(newValue);
  };

  // Xử lý khi người dùng gõ vào ô input
  const handleInputChange = (index, value) => {
    const newInputs = [...inputValue];
    // Chỉ cho phép nhập số
    const numberValue = value.replace(/[^0-9]/g, '');
    newInputs[index] = numberValue;
    setInputValue(newInputs);
  };

  // Xử lý logic khi người dùng nhập xong (Blur hoặc Enter)
  const handleInputCommit = () => {
    let newMin = Number(inputValue[0]);
    let newMax = Number(inputValue[1]);

    // Validate: Nếu để trống hoặc không phải số thì reset về min/max gốc
    if (inputValue[0] === '' || isNaN(newMin)) newMin = min;
    if (inputValue[1] === '' || isNaN(newMax)) newMax = max;

    // Validate: Đảm bảo min không lớn hơn max
    if (newMin > newMax) {
      const temp = newMin;
      newMin = newMax;
      newMax = temp;
    }

    // Validate: Đảm bảo nằm trong khoảng cho phép của slider
    if (newMin < min) newMin = min;
    if (newMax > max) newMax = max;

    // Cập nhật lại tất cả state và gọi callback filter
    const finalValue = [newMin, newMax];
    setSliderValue(finalValue);
    setInputValue(finalValue);
    onFilterChange(finalValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputCommit();
    }
  };

  return (
    <div className={styles.priceSliderContainer}>
      <h4 className={styles.title}>Lọc theo giá</h4>
      
      {/* Khu vực ô nhập liệu */}
      <div className={styles.inputsContainer}>
        <div className={styles.inputGroup}>
          <span className={styles.currencySymbol}>₫</span>
          <input
            type="text"
            className={styles.priceInput}
            value={inputValue[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            onBlur={handleInputCommit}
            onKeyDown={handleKeyDown}
            aria-label="Giá thấp nhất"
          />
        </div>
        
        <span className={styles.separator}>-</span>
        
        <div className={styles.inputGroup}>
          <span className={styles.currencySymbol}>₫</span>
          <input
            type="text"
            className={styles.priceInput}
            value={inputValue[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            onBlur={handleInputCommit}
            onKeyDown={handleKeyDown}
            aria-label="Giá cao nhất"
          />
        </div>
      </div>

      {/* Thanh Slider */}
      <div className={styles.sliderWrapper}>
        <Slider
          range
          min={min}
          max={max}
          value={sliderValue}
          onChange={handleSliderChange}
          onAfterChange={handleSliderAfterChange}
          step={10000} // Bước nhảy 10k cho mượt
          allowCross={false}
          trackStyle={[{ backgroundColor: '#000' }]} // Style trực tiếp hoặc qua class
          handleStyle={[
            { borderColor: '#000', backgroundColor: '#fff', opacity: 1 },
            { borderColor: '#000', backgroundColor: '#fff', opacity: 1 },
          ]}
          railStyle={{ backgroundColor: '#e5e5e5' }}
        />
      </div>
    </div>
  );
};

export default PriceRangeSlider;