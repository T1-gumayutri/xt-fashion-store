import React from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import { promotions } from '../../data/mockData';
import styles from './PromotionsPage.module.scss';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';

const PromotionsPage = () => {

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  return (
    <PageLayout pageTitle="Khuyến mãi">
      <div className={styles.promoContainer}>
        <h1>Ưu đãi & Khuyến mãi</h1>
        <p className={styles.subtitle}>
          Sử dụng các mã giảm giá dưới đây để có được mức giá tốt nhất!
        </p>
        <div className={styles.promoList}>
          {promotions.map((promo, index) => (
            <div key={index} className={styles.promoCard}>
              <div className={styles.promoInfo}>
                <h3 className={styles.promoCode}>{promo.code}</h3>
                <p className={styles.promoDescription}>{promo.description}</p>
                <span className={styles.promoExpiry}>{promo.expiry}</span>
              </div>
              <div className={styles.promoAction}>
                {promo.quantity !== null && (
                  <span className={styles.promoQuantity}>
                    Còn lại: {promo.quantity}
                  </span>
                )}
                <button 
                  onClick={() => handleCopyCode(promo.code)} 
                  className={styles.copyButton}
                >
                  <FiCopy /> Sao chép
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default PromotionsPage;