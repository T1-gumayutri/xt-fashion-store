import React, { useState } from 'react';
import styles from './ProductCard.module.scss';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../utils/imageHelper';
import { FiHeart, FiEye } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useWishlist } from '../../../contexts/WishlistContext';

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

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

  // Kiểm tra sản phẩm có trong wishlist không
  const isInWishlist = wishlist.some(item => 
    (item._id || item.id) === productId
  );

  // Xử lý thêm/xóa wishlist
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  // Xử lý xem chi tiết
  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/product/${productId}`, { state: product });
  };

  // Xử lý click vào card
  const handleCardClick = () => {
    navigate(`/product/${productId}`, { state: product });
  };

  return (
    <div 
      className={styles.cardWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.card} onClick={handleCardClick}>
        {/* Wishlist Button */}
        <button 
          className={`${styles.wishlistBtn} ${isInWishlist ? styles.active : ''}`}
          onClick={handleWishlistClick}
          title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          {isInWishlist ? <FaHeart /> : <FiHeart />}
        </button>

        {/* Product Image */}
        <div className={styles.imageWrapper}>
          <img 
            src={getProductImage()} 
            alt={productName}
            className={styles.image}
            onError={(e) => {e.target.onerror = null; e.target.src=""}}
          />
          
          {/* View Details Button - Show on hover */}
          <div className={`${styles.overlay} ${isHovered ? styles.show : ''}`}>
            <button 
              className={styles.viewDetailsBtn}
              onClick={handleViewDetails}
            >
              <FiEye />
              <span>Xem chi tiết</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.info}>
          <h4 className={styles.name}>{productName}</h4>
          <p className={styles.price}>{formatPrice(product.price)}</p>

          {/* Colors (nếu có) */}
          {product.colors && product.colors.length > 0 && (
            <div className={styles.colors}>
              {product.colors.slice(0, 5).map((color, index) => (
                <span
                  key={index}
                  className={styles.color}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {product.colors.length > 5 && (
                <span className={styles.moreColors}>+{product.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
