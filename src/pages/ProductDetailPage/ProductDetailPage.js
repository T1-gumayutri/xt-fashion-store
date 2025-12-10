import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './ProductDetailPage.module.scss';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { FaRegHeart, FaHeart, FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { toast } from 'react-toastify';

import productApi from '../../api/productApi';
import { getImageUrl } from '../../utils/imageHelper';

import ProductCard from '../../components/product/ProductCard/ProductCard';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = location.state;

  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  //--- State Data ---
  const [product, setProduct] = useState(initialData || null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //--- State Hiển thị ---
  const [currentMainImage, setCurrentMainImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  
  //--- State Chọn mua ---
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  //--- State Đánh giá ---
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  //--- Calling API ---
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!initialData) setLoading(true);
        
        // 1. Get detail product
        const res = await productApi.getById(productId);
        const data = res.data;
        setProduct(data);

        // Set img default
        if (data.img && data.img.length > 0) {
            setCurrentMainImage(getImageUrl(data.img[0].url));
        }

        // Reset form select
        setSelectedColor('');
        setSelectedSize('');
        setQuantity(1);
        
        // 2. Get reviews
        try {
          const resReviews = await productApi.getReviews(productId);
          setReviews(resReviews.data);
        } catch (reviewErr) {
          console.log("Chưa có review hoặc lỗi lấy review");
        }

        // 3. Get Related Products (cùng category)
        if (data.categoryId) {
            const catSlug = data.categoryId.slug || 'quan';
            const resRelated = await productApi.getAll({ category: catSlug, limit: 5 });
            
            // Lọc bỏ sản phẩm đang xem
            const related = resRelated.data.products
                .filter(p => p._id !== data._id)
                .slice(0, 4);
            setRelatedProducts(related);
        }

      } catch (error) {
        console.log("Lỗi:", error);
        toast.error("Không tìm thấy sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, initialData]);

  //--- Logic Biến thể (Size/Color) ---
  const uniqueSizes = product ? [...new Set(product.variants.map(v => v.size))] : [];
  const uniqueColors = product ? [...new Set(product.variants.map(v => v.color))] : [];

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Đổi ảnh nếu biến thể màu đó có ảnh riêng
    const variant = product.variants.find(v => v.color === color && v.image);
    if (variant && variant.image) {
        setCurrentMainImage(getImageUrl(variant.image));
    }
  };

  //--- Handlers ---
  const handleThumbnailClick = (clickedImage) => {
    setCurrentMainImage(clickedImage);
  };

  const handleQuantityChange = (amount) => {
    setQuantity(q => Math.max(1, q + amount));
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.warn('Vui lòng đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }
    if (!selectedColor || !selectedSize) {
      toast.error('Vui lòng chọn màu sắc và kích thước!');
      return;
    }
    
    await addToCart({
        productId: product.id,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity
    });
  };

  const handleWishlistClick = () => {
    if (!user) {
      toast.warn('Vui lòng đăng nhập để sử dụng chức năng này!');
      navigate('/login');
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.info(`${product.productName} đã được xóa khỏi danh sách yêu thích.`);
    } else {
      addToWishlist(product);
      toast.success(`${product.productName} đã được thêm vào danh sách yêu thích!`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };  

  //--- Logic Đánh giá ---
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
        stars.push(<FaStar key={i} />);
        } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} />);
        } else {
        stars.push(<FaRegStar key={i} />);
        }
    }
    return <span className={styles.starRating}>{stars}</span>;
  };
  
  const handleRatingClick = (rate) => {
    setNewRating(rate);
  };

  // === HÀM GỬI ĐÁNH GIÁ (ĐÃ SỬA) ===
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
        toast.warn('Vui lòng đăng nhập để đánh giá!');
        navigate('/login');
        return;
    }
    if (newRating === 0) {
        toast.error('Vui lòng chọn số sao!');
        return;
    }
    if (!newComment.trim()) {
        toast.error('Vui lòng nhập nội dung đánh giá!');
        return;
    }

    try {
        // 1. Gọi API lưu vào DB
        await productApi.addReview(product.id, {
            rating: newRating,
            comment: newComment
        }, token);

        toast.success('Gửi đánh giá thành công! (Chờ duyệt)');

        // 2. Tạo review tạm để hiển thị ngay lập tức (UX)
        const tempReview = {
            _id: Date.now().toString(), // ID tạm
            user: user,                 // Lấy object user hiện tại
            name: user.fullname || user.displayName, // Fallback tên
            rating: newRating,
            comment: newComment,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        // 3. Cập nhật state (Thêm vào đầu danh sách)
        setReviews([tempReview, ...reviews]);
        
        // 4. Reset form
        setShowReviewForm(false);
        setNewRating(0);
        setNewComment('');

        // LƯU Ý: Không gọi lại getReviews() ở đây để tránh bị mất review vừa tạo do lọc 'approved'

    } catch (error) {
        const msg = error.response?.data?.msg || 'Lỗi gửi đánh giá';
        toast.error(msg);
    }
  };


  //--- RENDER ---
  if (loading && !product) return <div style={{height:'60vh', display:'flex', justifyContent:'center', alignItems:'center'}}>Đang tải sản phẩm...</div>;
  
  if (!product) return  (
    <PageLayout pageTitle="Sản phẩm không tồn tại">
        <div className={styles.notFound} style={{textAlign: 'center', padding: '50px 0'}}>
            <h2>404 - Sản phẩm không tồn tại</h2>
            <p>Sản phẩm bạn đang tìm kiếm không có sẵn.</p>
            <button onClick={() => navigate('/')} style={{padding:'10px 20px', cursor:'pointer'}}>Quay về trang chủ</button>
        </div>
      </PageLayout>
  );

  return (
    <PageLayout pageTitle={product.productName}>
      <div className={styles.productDetailContainer}>
        {/* --- CỘT 1: HÌNH ẢNH --- */}
        <div className={styles.imageColumn}>
          <div className={styles.thumbnailSideColumn}>
              {product.img.map((item, index) => {
                const imgUrl = getImageUrl(item.url);
                return (
                  <button 
                      key={index} 
                      className={`${styles.thumbnailButton} ${imgUrl === currentMainImage ? styles.active : ''}`} 
                      onClick={() => handleThumbnailClick(imgUrl)}
                  >
                      <img src={imgUrl} alt="" />
                  </button>
                );
              })}
          </div>
          <div className={styles.mainImageWrapper}>
            <img 
              src={currentMainImage} 
              alt={product.productName}
              className={styles.mainImage}
            />
          </div>
        </div>

        {/* --- CỘT 2: THÔNG TIN --- */}
        <div className={styles.infoColumn}>
            <h1 className={styles.productName}>{product.productName}</h1>
            <p className={styles.productId}>Mã sản phẩm: {product.id ? product.id.slice(-8).toUpperCase() : '...'}</p>
            <div className={styles.price}>{formatPrice(product.price)}</div>
            
            <div className={styles.options}>
              {/* CHỌN MÀU */}
              <div className={styles.selector}>
                  <label>Màu sắc: <strong>{selectedColor}</strong></label>
                  <div className={styles.colors}>
                        {uniqueColors.map((color) => {
                        const variant = product.variants.find(v => v.color === color);
                        return (
                            <button 
                                key={color} 
                                className={`${styles.colorOption} ${selectedColor === color ? styles.active : ''}`}
                                style={{ backgroundColor: variant?.colorHex || '#ccc'}}
                                onClick={() => handleColorSelect(color)}
                                title={color}
                            />
                        );
                        })}
                    </div>
                </div>

                {/* CHỌN SIZE */}
                <div className={styles.selector}>
                    <label>Kích thước: <strong>{selectedSize}</strong></label>
                    <div className={styles.sizes}>
                        {uniqueSizes.map((size) => (
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

                {/* CHỌN SỐ LƯỢNG */}         
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
        </div>
      </div>

      {/* --- TAB SECTION (MÔ TẢ & ĐÁNH GIÁ) --- */}
      <div className={styles.tabsSection}>
        <div className={styles.tabButtons}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'description' ? styles.active : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Mô tả sản phẩm
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Đánh giá ({reviews.length})
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'description' && (
            <div className={styles.descriptionTab}>
              <div 
                className={styles.descriptionContent}
                dangerouslySetInnerHTML={{ __html: product.fullDescription || product.description}}
              />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.reviewsTab}>
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

              {/* LIST REVIEWS ĐÃ SỬA */}
              <div className={styles.reviewList}>
                {reviews.map(review => (
                  <div key={review._id || review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <strong>
                        {review.user?.fullname || review.name || 'Khách hàng'}
                      </strong>
                      <span className={styles.reviewDate}>
                        {review.createdAt 
                          ? new Date(review.createdAt).toLocaleDateString('vi-VN') 
                          : 'Vừa xong'}
                      </span>
                    </div>
                    {renderStars(review.rating)}
                    <p className={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- SẢN PHẨM LIÊN QUAN --- */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedProductsSection}>
          <h2 className={styles.relatedProductsTitle}>Sản phẩm liên quan</h2>
          <div className={styles.relatedProductsGrid}>
            {relatedProducts.map(relatedProd => (
              <ProductCard key={relatedProd._id} product={relatedProd} />
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ProductDetailPage;