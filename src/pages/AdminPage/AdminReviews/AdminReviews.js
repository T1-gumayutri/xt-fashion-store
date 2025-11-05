import React, { useMemo, useState } from "react";
import styles from "./AdminReviews.module.scss";
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

const MOCK_REVIEWS = [
  {
    id: 1,
    productId: "P001",
    productName: "Áo sơ mi Oxford trắng",
    customer: "Nguyễn Văn A",
    rating: 5,
    content: "Chất vải đẹp, form chuẩn, giao hàng nhanh.",
    createdAt: "2025-06-01 10:15",
    status: "approved", // approved | pending | hidden
  },
  {
    id: 2,
    productId: "P002",
    productName: "Quần tây slim fit",
    customer: "Trần B",
    rating: 3,
    content: "Quần đẹp nhưng giao nhầm size lần đầu.",
    createdAt: "2025-06-02 09:30",
    status: "pending",
  },
  {
    id: 3,
    productId: "P001",
    productName: "Áo sơ mi Oxford trắng",
    customer: "Lê C",
    rating: 4,
    content: "Vải ổn, hơi mỏng nhưng mặc mát.",
    createdAt: "2025-06-03 14:05",
    status: "hidden",
  },
  {
    id: 4,
    productId: "P003",
    productName: "Áo thun basic",
    customer: "John Doe",
    rating: 2,
    content: "Màu thực tế hơi khác hình, chất vải bình thường.",
    createdAt: "2025-06-05 08:22",
    status: "pending",
  },
];

export default function AdminReviews() {
  const [rows, setRows] = useState(MOCK_REVIEWS);

  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all"); // all | 1..5
  const [statusFilter, setStatusFilter] = useState("all"); // all | approved | pending | hidden
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [sortKey, setSortKey] = useState("createdAt"); // createdAt | rating
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // modal state
  const [viewing, setViewing] = useState(null);      // object review đang xem
  const [editing, setEditing] = useState(null);      // object review đang sửa
  const [editStatus, setEditStatus] = useState("approved");

  const filtered = useMemo(() => {
    let data = [...rows];

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.productId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q)
      );
    }

    if (ratingFilter !== "all") {
      const ratingNum = Number(ratingFilter);
      data = data.filter((r) => r.rating === ratingNum);
    }

    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (from) {
      const f = new Date(from).getTime();
      data = data.filter((r) => new Date(r.createdAt).getTime() >= f);
    }
    if (to) {
      const t = new Date(to).getTime();
      data = data.filter((r) => new Date(r.createdAt).getTime() <= t);
    }

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

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(total, start + pageSize);
  const pageRows = filtered.slice(start, end);

  const ratingStars = (n) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

  const statusBadge = (st) => {
    const text =
      st === "approved" ? "Hiển thị" : st === "pending" ? "Chờ duyệt" : "Ẩn";
    return <span className={`${styles.badge} ${styles[st]}`}>{text}</span>;
  };

  const handleDelete = (id) => {
    if (!window.confirm("Xóa đánh giá này?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const openView = (review) => setViewing(review);

  const openEdit = (review) => {
    setEditing(review);
    setEditStatus(review.status);
  };

  const saveEdit = () => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === editing.id ? { ...r, status: editStatus } : r
      )
    );
    setEditing(null);
  };

  const jumpTo = (e) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) setPage(n);
  };

  return (
    <div className={styles.adminReviews}>
      <h2>Quản lý đánh giá sản phẩm</h2>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch />
          <input
            placeholder="Tìm theo sản phẩm, mã sản phẩm, khách hàng…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <input
          type="date"
          className={styles.select}
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className={styles.select}
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
        />

        <select
          className={styles.select}
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả số sao</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="approved">Hiển thị</option>
          <option value="pending">Chờ duyệt</option>
          <option value="hidden">Ẩn</option>
        </select>

        <div className={styles.sortGroup}>
          <label>Sắp xếp theo:</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="rating">Số sao</option>
          </select>
          <button
            className={styles.dirBtn}
            onClick={() =>
              setSortDir((d) => (d === "asc" ? "desc" : "asc"))
            }
          >
            {sortDir === "asc" ? "↑ Tăng dần" : "↓ Giảm dần"}
          </button>
        </div>

        <div className={styles.pageSize}>
          <span>Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>mục / trang</span>
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>STT</th>
              <th>Sản phẩm</th>
              <th>Khách hàng</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th style={{ width: 150, textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: 24,
                    color: "#6b7280",
                  }}
                >
                  Chưa có đánh giá nào
                </td>
              </tr>
            ) : (
              pageRows.map((r, idx) => (
                <tr key={r.id}>
                  <td>{start + idx + 1}</td>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productName}>
                        {r.productName}
                      </span>
                      <span className={styles.productId}>Mã: {r.productId}</span>
                    </div>
                  </td>
                  <td>{r.customer}</td>
                  <td>
                    <span className={styles.stars}>{ratingStars(r.rating)}</span>
                    <span className={styles.ratingNum}>{r.rating}/5</span>
                  </td>
                  <td className={styles.contentCell}>{r.content}</td>
                  <td>{r.createdAt}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className={`${styles.iconBtn} ${styles.view}`}
                      title="Xem chi tiết"
                      onClick={() => openView(r)}
                    >
                      <FiEye />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.edit}`}
                      title="Sửa trạng thái"
                      onClick={() => openEdit(r)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.delete}`}
                      title="Xóa"
                      onClick={() => handleDelete(r.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER / PAGINATION */}
      <div className={styles.footer}>
        <div className={styles.rangeInfo}>
          {total === 0 ? "0-0" : `${start + 1}-${end}`} của {total} mục
        </div>

        <div className={styles.pager}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <FiChevronLeft />
          </button>
          <div className={styles.pageNow}>{page}</div>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <FiChevronRight />
          </button>

          <div className={styles.jump}>
            <span>Đến trang</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              onChange={jumpTo}
            />
          </div>
        </div>
      </div>

      {/* ===== MODAL XEM CHI TIẾT ===== */}
      {viewing && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setViewing(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Chi tiết đánh giá</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setViewing(null)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                <strong>Sản phẩm: </strong>
                {viewing.productName}{" "}
                <span className={styles.productId}>
                  (Mã: {viewing.productId})
                </span>
              </p>
              <p>
                <strong>Khách hàng: </strong>
                {viewing.customer}
              </p>
              <p>
                <strong>Đánh giá: </strong>
                <span className={styles.stars}>
                  {ratingStars(viewing.rating)}
                </span>{" "}
                <span className={styles.ratingNum}>
                  {viewing.rating}/5
                </span>
              </p>
              <p>
                <strong>Trạng thái: </strong>
                {statusBadge(viewing.status)}
              </p>
              <p>
                <strong>Ngày tạo: </strong>
                {viewing.createdAt}
              </p>
              <p>
                <strong>Nội dung:</strong>
              </p>
              <p className={styles.modalContent}>{viewing.content}</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnPrimary}
                onClick={() => setViewing(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL SỬA TRẠNG THÁI ===== */}
      {editing && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setEditing(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Cập nhật trạng thái đánh giá</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setEditing(null)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalTitle}>
                {editing.productName} – {editing.customer}
              </p>
              <label className={styles.modalLabel}>Trạng thái</label>
              <select
                className={styles.input}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="approved">Hiển thị</option>
                <option value="pending">Chờ duyệt</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnGhost}
                onClick={() => setEditing(null)}
              >
                Hủy
              </button>
              <button
                className={styles.btnPrimary}
                onClick={saveEdit}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
