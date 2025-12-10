import React from 'react';
import styles from './ProductCard.module.scss';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../../utils/imageHelper';

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  const getProductImage = () => {
    if (product.img && product.img.length > 0) {
      return getImageUrl(product.img[0].url);
    }
    
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0]);
    }

    if (product.image) return product.image;

    return '';
  };

  
  const productName = product.productName || product.name || 'Sản phẩm';
  const productId = product._id || product.id;

  return (
    <Link to={`/product/${productId}`} className={styles.cardLink}
      state={product}
      >
      <div className={styles.card}>
        
        <img 
          src={getProductImage()} 
          alt={productName} 
          className={styles.image} 
          onError={(e) => {e.target.onerror = null; e.target.src=""}}
        />
        
        <h4 className={styles.name}>
          {productName}
        </h4>

        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;