import React from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import styles from '../cart/SideCart.module.scss'; // Tái sử dụng CSS của SideCart
import { Link } from 'react-router-dom';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { shirtProducts, pantProducts, accessoryProducts } from '../../data/mockData';

const allProducts = [...shirtProducts, ...pantProducts, ...accessoryProducts];

const SideWishlist = () => {
  const { isWishlistOpen, closeWishlist, wishlist, removeFromWishlist } = useWishlist();

  // Từ danh sách ID trong wishlist, tìm thông tin đầy đủ của sản phẩm
  const wishlistProducts = allProducts.filter(product => wishlist.includes(product.id));

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const wishlistClasses = `${styles.sideCart} ${isWishlistOpen ? styles.open : ''}`;

  return (
    <>
      {isWishlistOpen && <div className={styles.overlay} onClick={closeWishlist}></div>}
      
      <div className={wishlistClasses}>
        <div className={styles.header}>
          <h3>Danh sách Yêu thích</h3>
          <button onClick={closeWishlist} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Danh sách yêu thích của bạn đang trống.</p>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItems}>
              {wishlistProducts.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <img src={item.imageUrl || item.images[0]} alt={item.name} />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                  </div>
                  <button onClick={() => removeFromWishlist(item.id)} className={styles.removeItem}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.footer}>
               <Link to="/wishlist" onClick={closeWishlist} className={styles.viewCartButton}>
                Xem tất cả
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideWishlist;