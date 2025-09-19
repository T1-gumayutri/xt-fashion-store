import React from 'react';
import styles from './ProductCard.module.scss';
import { Link } from 'react-router-dom';

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  return (
    <Link to={`/product/${product.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        {/* SỬA LỖI Ở ĐÂY: Dùng product.images[0] thay vì product.imageUrl */}
        <img 
          src={product.images && product.images.length > 0 ? product.images[0] : ''} 
          alt={product.name} 
          className={styles.image} 
        />
        
        <h4 className={styles.name}>
          {product.name}
        </h4>

        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;