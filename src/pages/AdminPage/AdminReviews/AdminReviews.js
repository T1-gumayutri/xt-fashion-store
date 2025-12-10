import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminReviews.module.scss";
import {
  FiEye,
  FiTrash2,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiRefreshCcw,
  FiStar
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import productApi from "../../../api/productApi";
import { toast } from "react-toastify";

const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "N/A");

const RatingStars = ({ count }) => {
  return (
    <div style={{ display: 'flex', color: '#fbbf24' }}>
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} fill={i < count ? "#fbbf24" : "none"} strokeWidth={i < count ? 0 : 2} color={i < count ? "#fbbf24" : "#d1d5db"} />
      ))}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  let label = "Ẩn";
  let styleClass = styles.hidden;

  if (status === "approved") {
    label = "Hiển thị";
    styleClass = styles.approved;
  } else if (status === "pending") {
    label = "Chờ duyệt";
    styleClass = styles.pending;
  }

  return <span className={`${styles.badge} ${styleClass}`}>{label}</span>;
};

export default function AdminReviews() {
  const { token } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Sort & Pagination
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState("");

  // Modal states
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [tempStatus, setTempStatus] = useState("approved");

  // ====== FETCH DATA ======
  useEffect(() => {
    const fetchReviews = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await productApi.getAllReviewsAdmin(token);
        
        // Map dữ liệu an toàn
        const data = (res.data || []).map((r) => ({
          id: r._id || r.id,
          productId: r.productId?._id || r.productId || "N/A",
          productName: r.productId?.productName || r.productName || "Sản phẩm đã xóa",
          customer: r.userId?.fullname || r.customerName || "Khách",
          rating: r.rating || 0,
          content: r.comment || r.content || "",
          createdAt: r.createdAt || new Date().toISOString(),
          status: r.status || "pending",
        }));
        setRows(data);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token]);

  // ====== FILTER & SORT LOGIC ======
  const filtered = useMemo(() => {
    let data = [...rows];

    // 1. Search Text
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q)
      );
    }

    // 2. Rating
    if (ratingFilter !== "all") {
      const ratingNum = Number(ratingFilter);
      data = data.filter((r) => r.rating === ratingNum);
    }

    // 3. Status
    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    // 4. Date Range (Đã sửa lỗi giờ)
    if (from) {
      const f = new Date(from);
      f.setHours(0,0,0,0);
      data = data.filter((r) => new Date(r.createdAt) >= f);
    }
    if (to) {
      const t = new Date(to);
      t.setHours(23, 59, 59, 999);
      data = data.filter((r) => new Date(r.createdAt) <= t);
    }

    // 5. Sort
    data.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];

      if (sortKey === "rating") {
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
  }, [rows, query, ratingFilter, statusFilter, from, to, sortKey, sortDir]);

  // Pagination Calculation
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset page khi filter đổi
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize, page, totalPages]);

  const start = (page - 1) * pageSize;
  const end = Math.min(total, start + pageSize);
  const pageRows = filtered.slice(start, end);

  // ====== HANDLERS ======
  
  const handleResetFilters = () => {
    setQuery("");
    setRatingFilter("all");
    setStatusFilter("all");
    setFrom("");
    setTo("");
    setSortKey("createdAt");
    setSortDir("desc");
    setPage(1);
  };

  const handleJumpPage = (e) => {
    if (e.key === "Enter") {
      const n = Number(jumpPage);
      if (n >= 1 && n <= totalPages) setPage(n);
      setJumpPage("");
    }
  };

  // --- DELETE REVIEW ---
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.")) return;
    try {
      await productApi.deleteReviewAdmin(id, token); 
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Đã xóa đánh giá");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa đánh giá");
    }
  };

  // --- OPEN EDIT MODAL ---
  const openEdit = (review) => {
    setEditing(review);
    setTempStatus(review.status);
  };

  // --- SAVE EDIT (UPDATE STATUS) ---
  const saveEdit = async () => {
    if (!editing) return;
    try {

      await productApi.updateReviewStatus(editing.id, tempStatus, token);
      
      setRows((prev) =>
        prev.map((r) =>
          r.id === editing.id ? { ...r, status: tempStatus } : r
        )
      );
      toast.success("Cập nhật trạng thái thành công");
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <div className={styles.adminReviews}>
      <div className={styles.header}>
        <h2>Quản lý đánh giá</h2>
        <button className={styles.resetBtn} onClick={handleResetFilters}>
          <FiRefreshCcw /> Đặt lại bộ lọc
        </button>
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <input
            className={styles.search}
            placeholder="🔍 Tìm sản phẩm, khách hàng..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
           <div className={styles.dateRange}>
            <span>Từ:</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span>Đến:</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div className={styles.filterGroup}>
           <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="all">⭐ Tất cả sao</option>
            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} sao</option>)}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Hiển thị</option>
            <option value="pending">Chờ duyệt</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="createdAt">Ngày tạo</option>
            <option value="rating">Số sao</option>
          </select>
          <button
            className={styles.dirBtn}
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          >
            {sortDir === "asc" ? "Tăng dần ⬆" : "Giảm dần ⬇"}
          </button>
           <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n} / trang</option>)}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}>Đang tải danh sách...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Khách hàng</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th style={{textAlign: 'right'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    Không tìm thấy đánh giá nào
                  </td>
                </tr>
              ) : (
                pageRows.map((r, idx) => (
                  <tr key={r.id}>
                    <td>{start + idx + 1}</td>
                    <td>
                      <div className={styles.productInfo}>
                        <div className={styles.prodName}>{r.productName}</div>
                      </div>
                    </td>
                    <td>{r.customer}</td>
                    <td>
                      <RatingStars count={r.rating} />
                      <small>{r.rating}/5</small>
                    </td>
                    <td>
                        <div className={styles.contentTruncate} title={r.content}>
                            {r.content.length > 50 ? r.content.substring(0, 50) + "..." : r.content}
                        </div>
                    </td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className={styles.actions}>
                      <button className={`${styles.iconBtn} ${styles.view}`} onClick={() => setViewing(r)} title="Xem chi tiết">
                        <FiEye />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.edit}`} onClick={() => openEdit(r)} title="Sửa trạng thái">
                        <FiEdit2 />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => handleDelete(r.id)} title="Xóa">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className={styles.footer}>
        <div className={styles.info}>
          Hiển thị <b>{total === 0 ? 0 : start + 1}-{end}</b> trong <b>{total}</b> đánh giá
        </div>
        <div className={styles.pager}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}> <FiChevronLeft /> </button>
          <span className={styles.curPage}>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}> <FiChevronRight /> </button>
          <div className={styles.jump}>
             <input 
              placeholder="Đến trang..."
              type="number" 
              value={jumpPage} 
              onChange={(e) => setJumpPage(e.target.value)} 
              onKeyDown={handleJumpPage}
            />
          </div>
        </div>
      </div>

      {/* ===== MODAL VIEW ===== */}
      {viewing && (
        <div className={styles.modalBackdrop} onClick={() => setViewing(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setViewing(null)}><FiX /></button>
            <h3>Chi tiết đánh giá</h3>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                 <label>Sản phẩm:</label>
                 <span>{viewing.productName}</span>
              </div>
              <div className={styles.detailRow}>
                 <label>Khách hàng:</label>
                 <span>{viewing.customer}</span>
              </div>
              <div className={styles.detailRow}>
                 <label>Đánh giá:</label>
                 <div style={{display:'flex', gap: 6, alignItems:'center'}}>
                    <RatingStars count={viewing.rating} /> <span>({viewing.rating}/5)</span>
                 </div>
              </div>
              <div className={styles.detailRow}>
                 <label>Ngày tạo:</label>
                 <span>{formatDate(viewing.createdAt)}</span>
              </div>
               <div className={styles.detailRow}>
                 <label>Trạng thái:</label>
                 <StatusBadge status={viewing.status} />
              </div>
              <div className={styles.detailContent}>
                 <label>Nội dung:</label>
                 <p>{viewing.content}</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
               <button className={styles.btnPrimary} onClick={() => setViewing(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL EDIT STATUS ===== */}
      {editing && (
        <div className={styles.modalBackdrop} onClick={() => setEditing(null)}>
           <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
             <button className={styles.closeModal} onClick={() => setEditing(null)}><FiX /></button>
            <h3>Cập nhật trạng thái</h3>
            <div className={styles.modalBody}>
                <p><strong>Khách hàng:</strong> {editing.customer}</p>
                <p><strong>Sản phẩm:</strong> {editing.productName}</p>
                <div className={styles.field} style={{marginTop: 15}}>
                   <label>Chọn trạng thái hiển thị:</label>
                   <select className={styles.input} value={tempStatus} onChange={(e) => setTempStatus(e.target.value)}>
                      <option value="approved">Hiển thị (Approved)</option>
                      <option value="pending">Chờ duyệt (Pending)</option>
                      <option value="hidden">Ẩn đi (Hidden)</option>
                   </select>
                </div>
            </div>
            <div className={styles.modalFooter}>
               <button className={styles.btnGhost} onClick={() => setEditing(null)}>Hủy</button>
               <button className={styles.btnPrimary} onClick={saveEdit}>Lưu thay đổi</button>
            </div>
           </div>
        </div>
      )}
    </div>
  );
}