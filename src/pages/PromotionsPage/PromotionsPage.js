import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './PromotionsPage.module.scss';
import { FiCopy, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

import promotionApi from '../../api/promotionApi';

const PromotionsPage = () => {

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setLoading(true);
        const res = await promotionApi.getActivePromotions();
        setPromotions(res.data);
      } catch (error) {
        console.log("Lỗi tải khuyến mãi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <PageLayout pageTitle="Khuyến mãi">
      <div className={styles.promoContainer}>
        <h1>Ưu đãi & Khuyến mãi</h1>
        <p className={styles.subtitle}>
          Sử dụng các mã giảm giá dưới đây để có được mức giá tốt nhất!
        </p>

        {loading ? (
           <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
             Đang tải các ưu đãi hấp dẫn...
           </div>
        ) : (
           <>
             {promotions.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                 Hiện chưa có chương trình khuyến mãi nào.
               </div>
             ) : (
               <div className={styles.promoList}>
                 {promotions.map((promo) => (
                   <div key={promo._id} className={styles.promoCard}>
                     <div className={styles.promoInfo}>
                       <h3 className={styles.promoCode}>{promo.code}</h3>
                       <p className={styles.promoDescription}>{promo.description}</p>
                       
                       <span className={styles.promoExpiry}>
                         <FiClock style={{marginRight: '5px', position: 'relative', top: '2px'}}/>
                         Hết hạn: {formatDate(promo.endDate)}
                       </span>
                     </div>

                     <div className={styles.promoAction}>
                       {promo.maxUses && (
                         <span className={styles.promoQuantity}>
                           Giới hạn: {promo.maxUses} lượt
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
             )}
           </>
        )}
      </div>
    </PageLayout>
  );
};

export default PromotionsPage;