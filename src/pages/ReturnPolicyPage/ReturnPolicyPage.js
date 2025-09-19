import React from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout'; // <-- IMPORT THE NEW LAYOUT
import styles from './ReturnPolicyPage.module.scss';

const ReturnPolicyPage = () => {
  return (
    // Use the PageLayout and pass in the title
    <PageLayout pageTitle="Chính sách đổi trả">
      <div className={styles.policyContainer}>
        <h1 className={styles.mainTitle}>Chính sách đổi hàng</h1>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. CHÍNH SÁCH ÁP DỤNG</h2>
          <ul>
            <li>Áp dụng từ ngày 01/09/2018.</li>
            <li>Trong vòng 30 ngày kể từ ngày mua sản phẩm với các sản phẩm TORANO.</li>
            <li>Áp dụng đối với sản phẩm nguyên giá và sản phẩm giảm giá ít hơn 50%.</li>
            <li>Sản phẩm nguyên giá chỉ được đổi 01 lần duy nhất sang sản phẩm nguyên giá khác và không thấp hơn giá trị sản phẩm đã mua.</li>
            <li>Sản phẩm giảm giá/khuyến mại ít hơn 50% được đổi 01 lần sang màu khác hoặc size khác trên cùng 1 mã trong điều kiện còn sản phẩm hoặc theo quy chế chương trình (nếu có). Nếu sản phẩm đổi đã hết hàng khi đó KH sẽ được đổi sang sản phẩm khác có giá trị ngang bằng hoặc cao hơn. Khách hàng sẽ thanh toán phần tiền chênh lệch nếu sản phẩm đổi có giá trị cao hơn sản phẩm đã mua.</li>
            <li>Chính sách chỉ áp dụng khi sản phẩm còn hóa đơn mua hàng, còn nguyên nhãn mác, thẻ bài đính kèm sản phẩm và sản phẩm không bị dơ bẩn, hư hỏng bởi những tác nhân bên ngoài cửa hàng sau khi mua sản phẩm.</li>
            <li>Sản phẩm đồ lót và phụ kiện không được đổi trả.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. ĐIỀU KIỆN ĐỔI SẢN PHẨM</h2>
          <ul>
            <li>Đổi hàng trong vòng 07 ngày kể từ ngày khách hàng nhận được sản phẩm.</li>
            <li>Sản phẩm còn nguyên tem, mác và chưa qua sử dụng.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. THỰC HIỆN ĐỔI SẢN PHẨM</h2>
          <p>Quý khách có thể đổi hàng Online tại hệ thống cửa hàng và đại lý TORANO trên toàn quốc . Lưu ý: vui lòng mang theo sản phẩm và phiếu giao hàng.</p>
          <p>Nếu tại khu vực bạn không có cửa hàng TORANO hoặc sản phẩm bạn muốn đổi thì vui lòng làm theo các bước sau:</p>
          <ol className={styles.steps}>
            <li><strong>Bước 1:</strong> Gọi đến Tổng đài: 0964942121 các ngày trong tuần (trừ ngày lễ), cung cấp mã đơn hàng và mã sản phẩm cần đổi.</li>
            <li><strong>Bước 2:</strong> Vui lòng gửi hàng đổi về địa chỉ : Kho Online TORANO - 1165 Giải Phóng, Thịnh Liệt, Q. Hoàng Mai, Hà Nội.</li>
            <li><strong>Bước 3:</strong> TORANO gửi đổi sản phẩm mới khi nhận được hàng. Trong trường hợp hết hàng, TORANO sẽ liên hệ xác nhận.</li>
          </ol>
        </section>
      </div>
    </PageLayout>
  );
};

export default ReturnPolicyPage;