import React, { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './FaqPage.module.scss';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Data for our FAQ items
const faqData = [
  {
    question: 'Làm thế nào để tôi đặt hàng online?',
    answer: 'TORANO rất vui lòng hỗ trợ khách hàng đặt hàng online bằng một trong những cách đặt hàng sau:<br/>- Truy cập trang web: https://xtfashion.vn/<br/>- Liên hệ số hotline: 0987654321 để đặt sản phẩm<br/>- Chat với tư vấn viên trên fanpage của TORANO: https://www.facebook.com/xtfashion.vn'
  },
  {
    question: 'Đặt hàng trên web tôi muốn đổi mẫu thì làm thế nào?',
    answer: 'Dạ chào anh/chị! Anh/chị vui lòng liên hệ trực tiếp CSKH qua https://www.facebook.com/xtfashion.vn/inbox hoặc hotline 0987654321 Cảm ơn anh chị đã lựa chọn XT Fashion!'
  },
  {
    question: 'Tôi có được xem hàng và thử không?',
    answer: 'Dạ anh chị có thể xem hàng trước khi thanh toán! Hiện tại Torano chưa áp dụng chính sách thử hàng khi mua hàng online! Rất mong anh chị thông cảm!'

  },
  {
    question: 'Tôi muốn đổi màu (size) thì cần làm gì?',
    answer: 'Dạ anh/chị có thể đổi hàng 1 lần duy nhất trong vòng 7 ngày tại bất kỳ cơ sở của XT Fashion hoặc gửi về kho online với điều kiện sản phẩm còn nguyên tem mác gắn liền sản phẩm và hóa đơn áp dụng cho những sản phẩm có mức sale nhỏ hơn 50%.'
  },
  {
    question: 'Tôi mua hàng rồi, không vừa ý có thể đổi lại hay không?',
    answer: 'Nội dung trả lời cho câu hỏi này sẽ được cập nhật sau.'
  },
  {
    question: 'Tôi muốn miễn phí ship',
    answer: 'Nội dung trả lời cho câu hỏi này sẽ được cập nhật sau.'
  },
];

// A reusable component for each FAQ item
const FaqItem = ({ item, isOpen, onClick }) => {
  return (
    <div className={styles.faqItem}>
      <div className={styles.question} onClick={onClick}>
        <span>{item.question}</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </div>
      {isOpen && (
        <div 
          className={styles.answer}
          // This is used to render HTML content safely
          dangerouslySetInnerHTML={{ __html: item.answer }} 
        />
      )}
    </div>
  );
};

const FaqPage = () => {
  // This state keeps track of which FAQ item is currently open
  const [openIndex, setOpenIndex] = useState(0); // Open the first question by default

  const handleItemClick = (index) => {
    // If the clicked item is already open, close it. Otherwise, open it.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout pageTitle="Câu hỏi thường gặp">
      <div className={styles.faqContainer}>
        {faqData.map((item, index) => (
          <FaqItem 
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => handleItemClick(index)}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default FaqPage;