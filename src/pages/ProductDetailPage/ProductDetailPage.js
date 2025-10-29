import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './ProductDetailPage.module.scss';
import { shirtProducts, pantProducts, accessoryProducts } from '../../data/mockData';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { FaRegHeart, FaHeart, FaStar, FaRegStar } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { toast } from 'react-toastify';
import ProductCard from '../../components/product/ProductCard/ProductCard';

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

  // --- STATE CHO PHẦN ĐÁNH GIÁ ---
  const [reviews, setReviews] = useState([
    { id: 1, author: 'Nguyễn Văn A', rating: 5, comment: 'Sản phẩm rất tốt, vải đẹp, đúng như mô tả!', date: '20/10/2025' },
    { id: 2, author: 'Trần Thị B', rating: 4, comment: 'Màu sắc hơi khác so với ảnh một chút nhưng chất lượng ổn. Giao hàng nhanh.', date: '15/10/2025' },
  ]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

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
      
      // TODO: Tải đánh giá thực tế từ API dựa trên productId
      // setReviews(fetchReviews(productId));
      
      // Reset form đánh giá khi đổi sản phẩm
      setShowReviewForm(false);
      setNewRating(0);
      setNewComment('');

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

    if (color.images && color.images.length > 0) {
      setCurrentMainImage(color.images[0]);
      setAllImages(color.images);
    }
  };
  
  const handleQuantityChange = (amount) => {
    setQuantity(q => Math.max(1, q + amount));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // --- CÁC HÀM XỬ LÝ ĐÁNH GIÁ ---
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    // const hasHalfStar = rating % 1 !== 0; // Tạm thời làm tròn, bạn có thể dùng FaStarHalf
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }
    return <span className={styles.starRating}>{stars}</span>;
  };
  
  const handleRatingClick = (rate) => {
    setNewRating(rate);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
        toast.warn('Vui lòng đăng nhập để viết đánh giá!');
        navigate('/login');
        return;
    }
    if (newRating === 0 || newComment.trim() === '') {
      toast.error('Vui lòng chọn số sao và viết bình luận!');
      return;
    }
    
    // Giả lập gửi đánh giá
    const newReview = {
      id: reviews.length + 3,
      author: user.email || 'Người dùng', // Giả sử user có prop 'email'
      rating: newRating,
      comment: newComment,
      date: new Date().toLocaleDateString('vi-VN'),
    };
    setReviews([newReview, ...reviews]); // Thêm đánh giá mới lên đầu
    setShowReviewForm(false);
    setNewRating(0);
    setNewComment('');
    toast.success('Gửi đánh giá thành công!');
    // TODO: Gửi đánh giá lên API
    // postReview(productId, { rating: newRating, comment: newComment });
  };
  // ----------------------------------------

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

  // --- (BẠN CHỈ CẦN THAY THẾ HÀM NÀY) ---
  // --- CẬP NHẬT LOGIC LẤY SẢN PHẨM LIÊN QUAN (CHUẨN HƠN) ---
  const getRelatedProducts = () => {
    // 1. Kiểm tra nếu không có sản phẩm hoặc sản phẩm không có subCategory
    if (!product || !product.subCategory) return []; 
    
    // 2. Lọc từ TOÀN BỘ sản phẩm (allProducts)
    const filtered = allProducts.filter(
      p => 
        p.subCategory === product.subCategory && // Điều kiện: Cùng subCategory
        p.id !== product.id                      // Điều kiện: Khác ID sản phẩm hiện tại
    );
    
    // 3. Lấy 4 sản phẩm đầu tiên (nếu mảng filtered ít hơn 4, slice sẽ tự động lấy hết)
    return filtered.slice(0, 4); 
  };
  const relatedProducts = getRelatedProducts();
  // ------------------------------------------
  // --- (KẾT THÚC PHẦN THAY THẾ) ---

  return (
    <PageLayout pageTitle={product.name}>
      <div className={styles.productDetailContainer}>
        {/* ... (Toàn bộ phần JSX cột ảnh và cột thông tin giữ nguyên) ... */}
        
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
            
            <div className={styles.description}>
              <h3 className={styles.descriptionTitle}>Mô tả sản phẩm</h3>
              <div 
                className={styles.descriptionContent}
                dangerouslySetInnerHTML={{ __html: product.fullDescription }}
              />
            </div>
            
            <div className={styles.reviewsSection}>
              <h3 className={styles.reviewsTitle}>Đánh giá sản phẩm</h3>
              
              {reviews.length > 0 ? (
                <div className={styles.reviewSummary}>
                  {renderStars(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)}
                  <span className={styles.reviewCount}>
                    ({reviews.length} đánh giá)
                  </span>
                </div>
              ) : (
                <p className={styles.noReviews}>Chưa có đánh giá nào cho sản phẩm này.</p>
              )}

              <button 
                onClick={() => {
                  if (!user) {
                    toast.warn('Vui lòng đăng nhập để viết đánh giá!');
                    navigate('/login');
                    return;
                  }
                  setShowReviewForm(!showReviewForm)
                }} 
                className={styles.writeReviewButton}
              >
                {showReviewForm ? 'Đóng lại' : 'Viết đánh giá của bạn'}
              </button>

              {showReviewForm && (
                <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
                  <label>Đánh giá của bạn:</label>
                  <div className={styles.starRatingInput}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} onClick={() => handleRatingClick(star)}>
                        {star <= newRating ? <FaStar /> : <FaRegStar />}
                      </span>
                    ))}
                  </div>
                  <label htmlFor="reviewComment">Bình luận của bạn:</label>
                  <textarea
                    id="reviewComment"
                    rows="4"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Sản phẩm này như thế nào..."
                  />
                  <button type="submit" className={styles.submitReviewButton}>Gửi đánh giá</button>
                </form>
              )}

              <div className={styles.reviewList}>
                {reviews.map(review => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <strong>{review.author}</strong>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                    {renderStars(review.rating)}
                    <p className={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>
      
      {/* ... (Phần Sản phẩm liên quan giữ nguyên) ... */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedProductsSection}>
          <h2 className={styles.relatedProductsTitle}>Sản phẩm liên quan</h2>
          <div className={styles.relatedProductsGrid}>
            {relatedProducts.map(relatedProd => (
              <ProductCard key={relatedProd.id} product={relatedProd} />
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ProductDetailPage;