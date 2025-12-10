import React from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import styles from './SideWishlist.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTrash2 } from 'react-icons/fi';

// 1. Import Helper xử lý ảnh
import { getImageUrl } from '../../utils/imageHelper';

const SideWishlist = () => {
  const { isWishlistOpen, closeWishlist, wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const wishlistClasses = `${styles.sideCart} ${isWishlistOpen ? styles.open : ''}`;

  return (
    <>
      {isWishlistOpen && <div className={styles.overlay} onClick={closeWishlist}></div>}
      
      <div className={wishlistClasses}>
        <div className={styles.header}>
          <h3>Danh sách Yêu thích ({wishlist.length})</h3>
          <button onClick={closeWishlist} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        {(!wishlist || wishlist.length === 0) ? (
          <div className={styles.emptyCart}>
            <p>Danh sách yêu thích của bạn đang trống.</p>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItems}>
              {wishlist.map(item => {
                if (!item) return null;

                const imageSrc = item.img && item.img.length > 0 
                    ? getImageUrl(item.img[0].url) 
                    : '';

                const itemId = item.id || item._id;

                return (
                  <div key={itemId} className={styles.cartItem}>
                    {/* Click ảnh sang trang chi tiết */}
                    <img 
                        src={imageSrc} 
                        alt={item.productName} 
                        onClick={() => {
                            closeWishlist();
                            navigate(`/product/${itemId}`);
                        }}
                        style={{cursor: 'pointer'}}
                    />
                    
                    <div className={styles.itemInfo}>
                      <Link 
                        to={`/product/${itemId}`} 
                        className={styles.itemName}
                        onClick={closeWishlist}
                      >
                          {item.productName}
                      </Link>
                      
                      <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                    </div>
                    
                    {/* Nút xóa */}
                    <button 
                        onClick={() => removeFromWishlist(itemId)} 
                        className={styles.removeItem}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className={styles.footer}>
               <button onClick={closeWishlist} className={styles.viewCartButton} style={{width: '100%', textAlign:'center'}}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideWishlist;