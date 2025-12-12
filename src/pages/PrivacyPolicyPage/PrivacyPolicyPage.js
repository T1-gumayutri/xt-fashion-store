import React from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
// We can reuse the same CSS as the return policy page for consistency
import styles from '../ReturnPolicyPage/ReturnPolicyPage.module.scss'; 

const PrivacyPolicyPage = () => {
  return (
    <PageLayout pageTitle="Chính sách bảo mật">
      <div className={styles.policyContainer}>
        <h1 className={styles.mainTitle}>Bảo mật thông tin khách hàng XT Fashion</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Thu thập và sử dụng thông tin của XT Fashion</h2>
          <p>XT Fashion chỉ thu thập các loại thông tin cơ bản liên quan đến đơn đặt hàng </p>
          <p>Các thông tin này được sử dụng nhằm mục đích xử lý đơn hàng, nâng cao chất lượng dịch vụ, nghiên cứu thị trường, các hoạt động marketing, chăm sóc khách hàng, quản lý nội bộ hoặc theo yêu cầu của pháp luật. Khách hàng tùy từng thời điểm có thể chỉnh sửa lại các thông tin đã cung cấp để đảm bảo được hưởng đầy đủ các quyền mà XT Fashion dành cho Khách hàng của mình.</p>
          <p><strong>XT Fashion cam kết:</strong></p>
          <ul>
            <li>Thông tin cá nhân của khách hàng được sử dụng đúng vào mục đích của việc thu thập và cung cấp;</li>
            <li>Mọi việc thu thập và sử dụng thông tin đã thu thập được của Khách hàng đều được thông qua ý kiến của Khách hàng</li>
            <li>Chỉ sử dụng các thông tin được Khách hàng đã cung cấp cho XT Fashion, không sử dụng các thông tin của Khách hàng được biết đến theo các phương thức khác;</li>
            <li>Thời gian lưu trữ và bảo mật thông tin:</li>
            <li>Chỉ cho phép các đối tượng sau được tiếp cận với thông tin của Khách hàng:
              <ul>
                <li>Người thực hiện việc cung cấp hàng hóa, dịch vụ từ XT Fashion theo yêu cầu của Khách hàng;</li>
                <li>Người thực hiện việc chăm sóc Khách hàng đã sử dụng hàng hóa, dịch vụ của XT Fashion;</li>
                <li>Người tiếp nhận và xử lý các thắc mắc của Khách hàng trong quá trình sử dụng hàng hóa, dịch vụ của XT Fashion;</li>
                <li>Cơ quan Nhà nước có thẩm quyền</li>
              </ul>
            </li>
            <li>Trong quá trình chào hàng, quảng cáo và chăm sóc Khách hàng, Khách hàng hoàn toàn có thể gửi yêu cầu dừng việc sử dụng thông tin theo cách thức tương ứng mà hoạt động chào hàng, quảng cáo và chăm sóc khách hàng gửi tới Khách hàng.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Cách thức bảo mật thông tin khách hàng:</h2>
          <p>Việc bảo mật các thông tin do Khách hàng cung cấp được dựa trên sự đảm bảo việc tuân thủ của từng cán bộ, nhân viên XT Fashion, đối tác và hệ thống lưu trữ dữ liệu. Trong trường hợp máy chủ lưu trữ thông tin bị hacker tấn công dẫn đến mất mát dữ liệu cá nhân Khách hàng, XT Fashion sẽ có trách nhiệm thông báo vụ việc cho cơ quan chức năng điều tra xử lý kịp thời và thông báo cho Khách hàng được biết. Tuy nhiên, do đặc điểm của môi trường internet, không một dữ liệu nào trên môi trường mạng cũng có thể được bảo mật 100%. Vì vậy, XT Fashion không cam kết chắc chắn rằng các thông tin tiếp nhận từ Khách hàng được bảo mật tuyệt đối.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Trách nhiệm bảo mật thông tin Khách hàng</h2>
          <p>Khách hàng vui lòng chỉ cung cấp đúng và đủ các thông tin theo yêu cầu của XT Fashion đặc biệt tránh cung cấp các thông tin liên quan đến tài khoản ngân hàng khi chưa được mã hóa thông tin trong các giao dịch thanh toán trực tuyến hoặc các thông tin nhạy cảm khác. Khách hàng hoàn toàn chịu trách nhiệm về tính trung thực và chính xác đối với các thông tin đã cung cấp cũng như tự chịu trách nhiệm nếu cung cấp các thông tin ngoài yêu cầu.</p>
          <p>Trong trường hợp Khách hàng cung cấp thông tin cá nhân của mình cho nhiều tổ chức, cá nhân khác nhau, Khách hàng phải yêu cầu các bên liên quan cùng bảo mật. Mọi thông tin cá nhân của Khách hàng khi bị tiết lộ gây thiệt hại đến Khách hàng, Khách hàng phải tự xác định được nguồn tiết lộ thông tin. XT Fashion không chịu trách nhiệm khi thông tin Khách hàng bị tiết lộ mà không có căn cứ xác đáng thể hiện XT Fashion là bên tiết lộ thông tin.</p>
          <p>XT Fashion không chịu trách nhiệm về việc tiết lộ thông tin của Khách hàng nếu Khách hàng không tuân thủ các yêu cầu trên.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Luật áp dụng khi xảy ra tranh chấp</h2>
          <p>Mọi tranh chấp xảy ra giữa Khách hàng và XT Fashion sẽ được hòa giải. Nếu hòa giải không thành sẽ được giải quyết tại Tòa án có thẩm quyền và tuân theo pháp luật Việt Nam.</p>
        </section>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicyPage;