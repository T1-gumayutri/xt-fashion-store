import React, { useState } from 'react';
import styles from './ColorFilter.module.scss';
import { FaCheck } from 'react-icons/fa'; // Cài đặt: npm install react-icons

const ColorFilter = ({ availableColors, onChange }) => {
  // State này sẽ lưu một mảng các MÀU (TÊN) đang được chọn
  // Ví dụ: ['Đen', 'Trắng']
  const [selectedColors, setSelectedColors] = useState([]);

  const handleSelectColor = (colorName) => {
    let newSelectedColors;

    if (selectedColors.includes(colorName)) {
      // Nếu màu đã được chọn -> Bỏ chọn (loại bỏ khỏi mảng)
      newSelectedColors = selectedColors.filter((c) => c !== colorName);
    } else {
      // Nếu màu chưa được chọn -> Thêm vào mảng
      newSelectedColors = [...selectedColors, colorName];
    }

    setSelectedColors(newSelectedColors);
    // Gọi hàm onChange ở component cha với mảng màu mới
    onChange(newSelectedColors);
  };

  // Hàm này để xóa tất cả bộ lọc
  const clearFilter = () => {
    setSelectedColors([]);
    onChange([]);
  };

  return (
    <div className={styles.colorFilterContainer}>
      <h4>Lọc theo màu:</h4>
      <div className={styles.swatchWrapper}>
        {/* Nút để xóa bộ lọc */}
        <button
          className={`${styles.allButton} ${
            selectedColors.length === 0 ? styles.selected : ''
          }`}
          onClick={clearFilter}
        >
          Tất cả
        </button>

        {/* Hiển thị các ô màu */}
        {availableColors.map((color) => (
          <span
            key={color.name}
            className={`${styles.colorSwatch} ${
              selectedColors.includes(color.name) ? styles.selected : ''
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
            onClick={() => handleSelectColor(color.name)}
          >
            {/* Hiển thị dấu check nếu màu này là 'Trắng' và đang được chọn */}
            {color.hex === '#FFFFFF' && selectedColors.includes(color.name) && (
              <FaCheck className={styles.checkIconDark} />
            )}
            {/* Hiển thị dấu check cho các màu khác */}
            {color.hex !== '#FFFFFF' && selectedColors.includes(color.name) && (
              <FaCheck className={styles.checkIconLight} />
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ColorFilter;