import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './ProductDetailPage.module.scss';
import { shirtProducts, pantProducts, accessoryProducts } from '../../data/mockData';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { toast } from 'react-toastify';
// XÓA DÒNG IMPORT KHÔNG CẦN THIẾT
// import ProductDescription from '../../components/product/ProductDescription';

const allProducts = [...shirtProducts, ...pantProducts, ...accessoryProducts];

const ProductDetailPage = () => {
  const { productId } = useParams();
  const product = allProducts.find(p => p.id === productId);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [currentMainImage, setCurrentMainImage] = useState('');
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    if (product) {
      const productImages = product.images || (product.imageUrl ? [product.imageUrl] : []);
      setAllImages(productImages);
      if (productImages.length > 0) {
        setCurrentMainImage(productImages[0]);
      } else {
        setCurrentMainImage('');
      }

      if (product.inventory && product.inventory.length > 0) {
        const firstColor = product.inventory[0];
        setSelectedColor(firstColor);
        setAvailableSizes(firstColor.sizes);
        setSelectedSize(firstColor.sizes[0]);
      } else {
        setSelectedColor(null);
        setAvailableSizes([]);
        setSelectedSize(null);
      }
      setQuantity(1);
    }
  }, [productId, product]);

  const handleThumbnailClick = (clickedImage) => {
    setCurrentMainImage(clickedImage);
  };

  const handleAddToCart = () => {
    if (product.inventory && (!selectedColor || !selectedSize)) {
      toast.error('Vui lòng chọn màu sắc và kích thước!');
      return;
    }
    addToCart(product, selectedColor, selectedSize, quantity);
    toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  const handleWishlistClick = () => {
    if (!user) {
      toast.warn('Vui lòng đăng nhập để sử dụng chức năng này!');
      navigate('/login');
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.info(`${product.name} đã được xóa khỏi danh sách yêu thích.`);
    } else {
      addToWishlist(product);
      toast.success(`${product.name} đã được thêm vào danh sách yêu thích!`);
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setAvailableSizes(color.sizes);
    setSelectedSize(color.sizes[0]);
    setQuantity(1);
  };
  
  const handleQuantityChange = (amount) => {
    setQuantity(q => Math.max(1, q + amount));
  };

  if (!product) {
    return (
      <PageLayout pageTitle="Sản phẩm không tồn tại">
        <div className={styles.notFound}>
          <h2>404 - Sản phẩm không tồn tại</h2>
          <p>Sản phẩm bạn đang tìm kiếm không có sẵn.</p>
          <Link to="/">Quay về trang chủ</Link>
        </div>
      </PageLayout>
    );
  }
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <PageLayout pageTitle={product.name}>
      <div className={styles.productDetailContainer}>
        <div className={styles.imageColumn}>
          <div className={styles.thumbnailSideColumn}>
              {allImages.map((image, index) => (
                  <button 
                      key={index} 
                      className={`${styles.thumbnailButton} ${image === currentMainImage ? styles.active : ''}`} 
                      onClick={() => handleThumbnailClick(image)}
                  >
                      <img src={image} alt={`Thumbnail ${index + 1}`} />
                  </button>
              ))}
          </div>
          <div className={styles.mainImageWrapper}>
            <img 
              src={currentMainImage} 
              alt={product.name}
              className={styles.mainImage}
            />
          </div>
        </div>

        <div className={styles.infoColumn}>
            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.productId}>Mã sản phẩm: {product.id}</p>
            <div className={styles.price}>{formatPrice(product.price)}</div>
            
            <div className={styles.options}>
                {product.inventory && product.inventory.length > 0 && (
                  <>
                    <div className={styles.selector}>
                        <label>Màu sắc: <strong>{selectedColor?.color}</strong></label>
                        <div className={styles.colors}>
                            {product.inventory.map((item) => (
                            <button 
                                key={item.color} 
                                className={`${styles.colorOption} ${selectedColor?.color === item.color ? styles.active : ''}`}
                                style={{ backgroundColor: item.colorHex }}
                                onClick={() => handleColorSelect(item)}
                                title={item.color}
                            />
                            ))}
                        </div>
                    </div>
                    <div className={styles.selector}>
                        <label>Kích thước:</label>
                        <div className={styles.sizes}>
                            {availableSizes.map((size) => (
                            <button 
                                key={size}
                                className={selectedSize === size ? styles.active : ''}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                            ))}
                        </div>
                    </div>
                  </>
                )}
                <div className={styles.selector}>
                    <label>Số lượng:</label>
                    <div className={styles.quantityAdjuster}>
                        <button onClick={() => handleQuantityChange(-1)}><FiMinus /></button>
                        <input type="number" value={quantity} readOnly />
                        <button onClick={() => handleQuantityChange(1)}><FiPlus /></button>
                    </div>
                </div>
            </div>
            
            <div className={styles.actions}>
                <button onClick={handleAddToCart} className={styles.addToCartButton}>
                    <FiShoppingCart />
                    Thêm vào giỏ hàng
                </button>
                <button onClick={handleWishlistClick} className={styles.wishlistButton}>
                  {isInWishlist(product.id) ? <FaHeart style={{ color: '#c92127' }} /> : <FaRegHeart />}
                </button>
            </div>
            
            {/* THAY THẾ COMPONENT BẰNG CODE HIỂN THỊ TRỰC TIẾP */}
            <div className={styles.description}>
              <h3 className={styles.descriptionTitle}>Mô tả sản phẩm</h3>
              <div 
                className={styles.descriptionContent}
                dangerouslySetInnerHTML={{ __html: product.fullDescription }}
              />
            </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductDetailPage;