// src/pages/Admin/AdminOrders.js
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminOrders.module.scss";
import {
  FiEye,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCcw,
  FiX
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from '../../../contexts/AuthContext';
import orderApi from '../../../api/orderApi';

// ===== HELPER FUNCTIONS =====
const methodText = (m) => {
  if (m === "cod") return "Thanh toán khi nhận hàng (COD)";
  if (m === "bank") return "VNPAY";
  return m || "";
};

const payText = (s) => {
  const map = {
    unpaid: "Chưa thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
    expired: "Hết hạn",
  };
  return map[s] || s || "";
};

const orderText = (s) => {
  const map = {
    pending: "Đang chờ xử lý",
    processing: "Đang chuẩn bị hàng",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return map[s] || s || "";
};

const payBadgeClass = (s) => {
  switch (s) {
    case "paid": return styles.paid;
    case "unpaid": return styles.unpaid;
    case "failed":
    case "expired": return styles.failed;
    case "refunded": return styles.refund;
    default: return "";
  }
};

const orderBadgeClass = (s) => {
  return s === "cancelled" ? styles.canceled : styles.confirmed;
};

// Options
const methodOptions = [
  { value: "all", label: "Tất cả phương thức" },
  { value: "cod", label: "COD" },
  { value: "bank", label: "VNPAY" },
];

const payStatusOptions = [
  { value: "all", label: "Tất cả TT thanh toán" },
  { value: "unpaid", label: "Chưa thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "failed", label: "Thất bại" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

const orderStatusOptions = [
  { value: "all", label: "Tất cả trạng thái đơn" },
  { value: "pending", label: "Đang chờ xử lý" },
  { value: "processing", label: "Đang chuẩn bị" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function AdminOrders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [method, setMethod] = useState("all");
  const [payStatus, setPayStatus] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");

  // sort + paging
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState("");

  // modal edit
  const [editingOrder, setEditingOrder] = useState(null);

  // ===== LOAD DATA =====
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await orderApi.getAllOrders(token);
        const mapped = (res.data || []).map((o) => ({
          id: o.id,
          orderCode: o.orderCode || o.id,
          customer: o.userId?.fullname || o.shippingInfo?.recipientName || "Khách",
          receiver: o.shippingInfo?.recipientName || "",
          method: o.paymentMethod,
          payStatus: o.paymentStatus || (o.isPaid ? "paid" : "unpaid"),
          orderStatus: o.status,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          total: o.total || 0,
        }));
        setRows(mapped);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // ===== LOGIC LỌC + SẮP XẾP =====
  const filtered = useMemo(() => {
    let data = [...rows];

    // 1. Filter Text
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          String(r.orderCode).toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.receiver.toLowerCase().includes(q)
      );
    }

    // 2. Filter Dropdowns
    if (method !== "all") data = data.filter((r) => r.method === method);
    if (payStatus !== "all") data = data.filter((r) => r.payStatus === payStatus);
    if (orderStatus !== "all") data = data.filter((r) => r.orderStatus === orderStatus);

    // 3. Filter Date
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      data = data.filter((r) => new Date(r.createdAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      data = data.filter((r) => new Date(r.createdAt) <= toDate);
    }

    // 4. Sort
    data.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];

      if (sortKey === "total") {
        va = Number(va);
        vb = Number(vb);
      } else {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [rows, query, method, payStatus, orderStatus, dateFrom, dateTo, sortKey, sortDir]);

  // ===== PAGINATION =====
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filtered, totalPages, page]);

  const start = (page - 1) * pageSize;
  const end = Math.min(total, start + pageSize);
  const pageRows = filtered.slice(start, end);

  const handleJumpPageKeyDown = (e) => {
    if (e.key === 'Enter') {
      const n = Number(jumpPage);
      if (Number.isFinite(n) && n >= 1 && n <= totalPages) {
        setPage(n);
      }
      setJumpPage("");
    }
  };

  const handleResetFilters = () => {
    setQuery("");
    setDateFrom("");
    setDateTo("");
    setMethod("all");
    setPayStatus("all");
    setOrderStatus("all");
    setSortKey("createdAt");
    setSortDir("desc");
    setPage(1);
  };

  // ===== HANDLE EDIT =====
  const handleEdit = (id) => {
    const order = rows.find((o) => o.id === id);
    if (order) {
      setEditingOrder({ ...order });
    }
  };

  // ===== UPDATE STATUS (Gồm cả trạng thái đơn & thanh toán) =====
  const handleSaveEdit = async () => {
    if (!editingOrder || !token) return;
    try {
      const res = await orderApi.updateStatus(
        editingOrder.id,
        { 
          status: editingOrder.orderStatus,
          paymentStatus: editingOrder.payStatus // Gửi paymentStatus lên server
        },
        token
      );
      const updated = res.data;
      
      setRows((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id
            ? {
                ...o,
                orderStatus: updated.status,
                // Cập nhật lại payStatus mới
                payStatus: updated.paymentStatus || editingOrder.payStatus,
                updatedAt: updated.updatedAt,
              }
            : o
        )
      );
      toast.success("Cập nhật thành công");
      setEditingOrder(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Cập nhật thất bại");
    }
  };

  return (
    <div className={styles.adminOrders}>
      <div className={styles.header}>
        <h2>Quản lý đơn hàng</h2>
        <button className={styles.resetBtn} onClick={handleResetFilters}>
          <FiRefreshCcw /> Đặt lại bộ lọc
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <input
            className={styles.search}
            placeholder="🔍 Tìm mã đơn, khách hàng..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
          <div className={styles.dateRange}>
            <span>Từ:</span>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            <span>Đến:</span>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }}>
            {methodOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={payStatus} onChange={(e) => { setPayStatus(e.target.value); setPage(1); }}>
            {payStatusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={orderStatus} onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}>
            {orderStatusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="createdAt">Ngày tạo</option>
            <option value="updatedAt">Cập nhật</option>
            <option value="total">Tổng tiền</option>
          </select>
          <button className={styles.dirBtn} onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
            {sortDir === "asc" ? "Tăng dần ⬆" : "Giảm dần ⬇"}
          </button>
          
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / trang</option>)}
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}>Đang tải dữ liệu...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Tổng tiền</th>
                <th className={styles.actionsHeader}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>Không tìm thấy đơn hàng nào</td>
                </tr>
              ) : (
                pageRows.map((r, idx) => (
                  <tr key={r.id}>
                    <td>{start + idx + 1}</td>
                    <td className={styles.code}>{r.orderCode}</td>
                    <td>
                      <div className={styles.custName}>{r.customer}</div>
                      <small style={{color:'#888'}}>{r.receiver !== r.customer ? `(Nhận: ${r.receiver})` : ''}</small>
                    </td>
                    <td>
                       <div>{methodText(r.method)}</div>
                       <span className={`${styles.badge} ${payBadgeClass(r.payStatus)}`}>
                         {payText(r.payStatus)}
                       </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${orderBadgeClass(r.orderStatus)}`}>
                        {orderText(r.orderStatus)}
                      </span>
                    </td>
                    <td>
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                        <br/>
                        <small>{new Date(r.createdAt).toLocaleTimeString("vi-VN")}</small>
                    </td>
                    <td className={styles.money}>{r.total.toLocaleString("vi-VN")} đ</td>
                    <td className={styles.actions}>
                      <button 
                        className={`${styles.iconBtn} ${styles.view}`} 
                        title="Xem chi tiết"
                        onClick={() => navigate(`/admin/orders/${r.id}`)}
                      >
                        <FiEye />
                      </button>
                      <button 
                        className={`${styles.iconBtn} ${styles.edit}`} 
                        title="Sửa trạng thái"
                        onClick={() => handleEdit(r.id)}
                      >
                        <FiEdit2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.info}>
          Hiển thị <b>{total === 0 ? 0 : start + 1}-{end}</b> trong tổng <b>{total}</b> đơn hàng
        </div>

        <div className={styles.pager}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}> <FiChevronLeft /> </button>
          <span className={styles.curPage}>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}> <FiChevronRight /> </button>
          
          <div className={styles.jump}>
            <input 
              type="number" 
              placeholder="Đến trang..."
              value={jumpPage} 
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={handleJumpPageKeyDown}
            />
          </div>
        </div>
      </div>

      {/* MODAL EDIT ĐÃ ĐƯỢC SỬA */}
      {editingOrder && (
        <div className={styles.modalBackdrop} onClick={() => setEditingOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
             <button className={styles.closeModal} onClick={() => setEditingOrder(null)}><FiX /></button>
            <h3>Cập nhật trạng thái đơn: {editingOrder.orderCode}</h3>
            
            <div className={styles.modalBody}>
               {/* 1. Hiển thị phương thức thanh toán (Readonly) */}
               <div className={styles.field}>
                <label>Phương thức thanh toán</label>
                <input
                  type="text"
                  value={methodText(editingOrder.method)}
                  disabled
                  style={{ background: "#f3f4f6", color: "#888" }}
                />
               </div>

               {/* 2. Trạng thái thanh toán (Cho phép sửa) */}
               <div className={styles.field}>
                <label>Trạng thái thanh toán</label>
                <select
                  value={editingOrder.payStatus}
                  onChange={(e) =>
                    setEditingOrder((prev) => ({
                      ...prev,
                      payStatus: e.target.value,
                    }))
                  }
                >
                  {payStatusOptions
                    .filter((s) => s.value !== "all")
                    .map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                </select>
               </div>

               {/* 3. Trạng thái đơn hàng */}
               <div className={styles.field}>
                <label>Trạng thái đơn hàng</label>
                <select
                  value={editingOrder.orderStatus}
                  onChange={(e) =>
                    setEditingOrder((prev) => ({ ...prev, orderStatus: e.target.value }))
                  }
                >
                  {orderStatusOptions.filter((s) => s.value !== "all").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
               </div>
            </div>
            
            <div className={styles.modalFooter}>
               <button className={styles.cancelBtn} onClick={() => setEditingOrder(null)}>Hủy</button>
               <button className={styles.saveBtn} onClick={handleSaveEdit}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}