import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiCreditCard, FiMapPin, FiUser} from 'react-icons/fi';
import styles from './AdminOrderDetail.module.scss';
import orderApi from '../../../api/orderApi';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await orderApi.getOrderById(id, token); 
        setOrder(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy đơn hàng");
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDetail();
  }, [id, token, navigate]);

  if (loading) return <div className={styles.loading}>Đang tải chi tiết đơn hàng...</div>;
  if (!order) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/admin/orders')}>
          <FiArrowLeft /> Quay lại
        </button>
        <div className={styles.titleGroup}>
            <h2>Chi tiết đơn hàng #{order.orderCode || order.id}</h2>
            <span className={`${styles.badge} ${styles[order.status]}`}>
                {order.status}
            </span>
        </div>
        <button className={styles.printBtn} onClick={() => window.print()}>
            <FiPrinter /> In hóa đơn
        </button>
      </div>

      <div className={styles.grid}>
        {/* Cột trái: Danh sách sản phẩm */}
        <div className={styles.mainContent}>
            <div className={styles.card}>
                <h3>Danh sách sản phẩm</h3>
                <table className={styles.productTable}>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>SL</th>
                            <th align="right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div className={styles.productInfo}>
                                        <img src={item.image} alt="" className={styles.thumb} />
                                        <div>
                                            <div className={styles.prodName}>{item.name}</div>
                                            <div className={styles.variant}>Size: {item.size} - Màu: {item.color}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{item.price?.toLocaleString()}đ</td>
                                <td>x{item.quantity}</td>
                                <td align="right">{(item.price * item.quantity).toLocaleString()}đ</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} align="right">Tạm tính:</td>
                            <td align="right">{order.total?.toLocaleString()}đ</td>
                        </tr>
                        <tr className={styles.totalRow}>
                            <td colSpan={3} align="right">Tổng cộng:</td>
                            <td align="right">{order.total?.toLocaleString()}đ</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        {/* Cột phải: Thông tin khách & Thanh toán */}
        <div className={styles.sidebar}>
            <div className={styles.card}>
                <h3><FiUser /> Khách hàng</h3>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Tên:</span>
                    <span>{order.userId?.fullname || order.shippingInfo?.recipientName || "Khách vãng lai"}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Email:</span>
                    <span>{order.userId?.email || "---"}</span>
                </div>
            </div>

            <div className={styles.card}>
                <h3><FiMapPin /> Địa chỉ giao hàng</h3>
                <p className={styles.address}>
                    <strong>{order.shippingInfo?.recipientName}</strong><br/>
                    {order.shippingInfo?.phone}<br/>
                    {order.shippingInfo?.address}<br/>
                    {/* Thêm phường/xã, quận/huyện nếu có */}
                </p>
            </div>

            <div className={styles.card}>
                <h3><FiCreditCard /> Thanh toán</h3>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Phương thức:</span>
                    <span style={{textTransform: 'uppercase', fontWeight: 600}}>{order.paymentMethod}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Trạng thái:</span>
                    <span className={order.isPaid ? styles.textSuccess : styles.textWarning}>
                        {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;