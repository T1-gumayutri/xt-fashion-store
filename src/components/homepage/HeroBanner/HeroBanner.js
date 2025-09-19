import React from 'react';
// 1. Import các component cần thiết từ Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// 2. Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 3. Import file CSS module của bạn
import styles from './HeroBanner.module.scss';

// 4. Định nghĩa danh sách ảnh banner của bạn
const bannerImages = [
  '/assets/images/hero-banner.jpg', // Banner cũ
  '/assets/images/banner-2.jpg',    // Banner mới 1 (thay tên file cho đúng)
  '/assets/images/banner-3.jpg',    // Banner mới 2 (thay tên file cho đúng)
];

const HeroBanner = () => {
  return (
    <div className={styles.heroBannerContainer}>
      <Swiper
        // 5. Kích hoạt các module bạn cần
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        centeredSlides={true}
        loop={true} // Cho phép lặp vô tận
        autoplay={{
          delay: 3000, // Tự chuyển sau mỗi 3 giây
          disableOnInteraction: false, // Không dừng khi người dùng tương tác
        }}
        pagination={{
          clickable: true, // Cho phép nhấn vào các chấm tròn để chuyển slide
        }}
        navigation={true} // Hiển thị nút qua lại
        className={styles.mySwiper}
      >
        {/* 6. Dùng map để tạo các slide từ danh sách ảnh */}
        {bannerImages.map((imageUrl, index) => (
          <SwiperSlide key={index}>
            <img src={imageUrl} alt={`Banner ${index + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroBanner;