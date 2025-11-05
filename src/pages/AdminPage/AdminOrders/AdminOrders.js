import React, { useMemo, useState } from "react";
import styles from "./AdminOrders.module.scss";
import {
  FiEye,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

/** Mock data theo đúng cấu trúc ảnh */
const MOCK_ORDERS = [
  {
    id: 18,
    orderCode: "#18",
    customer: "John Doe",
    receiver: "Quoc Ta",
    method: "cod",                 
    payStatus: "unpaid",           
    orderStatus: "confirmed",      
    createdAt: "2025-06-07 11:23",
    updatedAt: "2025-06-07 11:24",
    total: 1105000000,
  },
  {
    id: 17,
    orderCode: "#17",
    customer: "John Doe",
    receiver: "Quoc Ta",
    method: "cod",
    payStatus: "refund",
    orderStatus: "canceled",
    createdAt: "2025-06-07 11:10",
    updatedAt: "2025-06-07 11:15",
    total: 45000000,
  },
  {
    id: 16,
    orderCode: "#16",
    customer: "John Doe",
    receiver: "Quoc Ta",
    method: "vnpay",
    payStatus: "failed",
    orderStatus: "canceled",
    createdAt: "2025-06-07 11:09",
    updatedAt: "2025-06-07 11:23",
    total: 45000000,
  },
  {
    id: 15,
    orderCode: "#15",
    customer: "John Doe",
    receiver: "Quoc Ta",
    method: "vnpay",
    payStatus: "failed",
    orderStatus: "canceled",
    createdAt: "2025-06-07 11:09",
    updatedAt: "2025-06-07 11:23",
    total: 112,
  },
];

export default function AdminOrders() {
  const [rows, setRows] = useState(MOCK_ORDERS);

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
  const [pageSize, setPageSize] = useState(5);

  // state cho modal sửa
  const [editingOrder, setEditingOrder] = useState(null);

  const methods = ["all", "cod", "vnpay", "momo"];
  const payStatuses = ["all", "unpaid", "refund", "failed", "paid"];
  const orderStatuses = ["all", "confirmed", "canceled"];

  const filtered = useMemo(() => {
    let data = [...rows];

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.orderCode.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.receiver.toLowerCase().includes(q)
      );
    }

    if (method !== "all") data = data.filter((r) => r.method === method);
    if (payStatus !== "all") data = data.filter((r) => r.payStatus === payStatus);
    if (orderStatus !== "all") data = data.filter((r) => r.orderStatus === orderStatus);

    if (dateFrom) data = data.filter((r) => new Date(r.createdAt) >= new Date(dateFrom));
    if (dateTo) data = data.filter((r) => new Date(r.createdAt) <= new Date(dateTo));

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

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(total, start + pageSize);
  const pageRows = filtered.slice(start, end);

  const badge = (t, cls) => <span className={`${styles.badge} ${styles[cls]}`}>{t}</span>;

  const methodText = (m) =>
    m === "cod" ? "Thanh toán khi nhận hàng" : m === "vnpay" ? "VN Pay" : "MoMo";

  const payText = (s) =>
    s === "unpaid" ? "Chưa thanh toán" : s === "refund" ? "Yêu cầu hoàn tiền" : s === "failed" ? "Thất bại" : "Đã thanh toán";

  const orderText = (s) => (s === "confirmed" ? "Đã xác nhận" : "Đã hủy");

  const jumpTo = (e) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) setPage(n);
  };

  const handleEdit = (id) => {
    const order = rows.find((o) => o.id === id);
    if (order) setEditingOrder({ ...order });
  };

  const handleSaveEdit = () => {
    if (!editingOrder) return;
    setRows((prev) =>
      prev.map((o) => (o.id === editingOrder.id ? editingOrder : o))
    );
    setEditingOrder(null);
  };

  return (
    <div className={styles.adminOrders}>
      <h2>Quản lý đơn hàng</h2>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Tìm theo mã, khách hàng, người nhận…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <input
          className={styles.select}
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          placeholder="Từ ngày"
        />
        <input
          className={styles.select}
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          placeholder="Đến ngày"
        />
        <select
          className={styles.select}
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            setPage(1);
          }}
        >
          {methods.map((m) => (
            <option key={m} value={m}>
              {m === "all" ? "Phương thức thanh toán" : methodText(m)}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={payStatus}
          onChange={(e) => {
            setPayStatus(e.target.value);
            setPage(1);
          }}
        >
          {payStatuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "Trạng thái thanh toán" : payText(s)}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={orderStatus}
          onChange={(e) => {
            setOrderStatus(e.target.value);
            setPage(1);
          }}
        >
          {orderStatuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "Trạng thái đơn hàng" : orderText(s)}
            </option>
          ))}
        </select>

        <div className={styles.sortGroup}>
          <label>Sắp xếp theo:</label>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="createdAt">Ngày tạo</option>
            <option value="updatedAt">Cập nhật</option>
            <option value="total">Tổng tiền</option>
          </select>
          <button
            className={styles.dirBtn}
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
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
            {[5, 10, 20, 50].map((n) => (
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
              <th style={{ width: 70 }}>STT</th>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Người nhận</th>
              <th>Phương thức</th>
              <th>Trạng thái thanh toán</th>
              <th>Trạng thái đơn hàng</th>
              <th>Ngày tạo</th>
              <th>Cập nhật</th>
              <th>Tổng tiền</th>
              <th style={{ width: 130, textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              pageRows.map((r, idx) => (
                <tr key={r.id}>
                  <td>{start + idx + 1}</td>
                  <td>{r.orderCode}</td>
                  <td>{r.customer}</td>
                  <td>{r.receiver}</td>
                  <td>{methodText(r.method)}</td>
                  <td>
                    {badge(
                      payText(r.payStatus),
                      r.payStatus 
                    )}
                  </td>
                  <td>
                    {badge(
                      orderText(r.orderStatus),
                      r.orderStatus 
                    )}
                  </td>
                  <td>{r.createdAt}</td>
                  <td>{r.updatedAt}</td>
                  <td className={styles.money}>{r.total.toLocaleString("vi-VN")} đ</td>
                  <td style={{ textAlign: "right" }}>
                    <button className={`${styles.iconBtn} ${styles.view}`} title="Xem">
                      <FiEye />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.edit}`}
                      title="Sửa"
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
      </div>

      {/* PAGINATION */}
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
            <input type="number" min={1} max={totalPages} onChange={jumpTo} />
          </div>
        </div>
      </div>

      {/* MODAL EDIT ORDER */}
      {editingOrder && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              Sửa đơn hàng {editingOrder.orderCode}
            </h3>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Khách hàng</label>
                <input
                  type="text"
                  value={editingOrder.customer}
                  onChange={(e) =>
                    setEditingOrder((prev) => ({
                      ...prev,
                      customer: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label>Người nhận</label>
                <input
                  type="text"
                  value={editingOrder.receiver}
                  onChange={(e) =>
                    setEditingOrder((prev) => ({
                      ...prev,
                      receiver: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label>Phương thức thanh toán</label>
                <select
                  value={editingOrder.method}
                  onChange={(e) =>
                    setEditingOrder((prev) => ({
                      ...prev,
                      method: e.target.value,
                    }))
                  }
                >
                  {methods
                    .filter((m) => m !== "all")
                    .map((m) => (
                      <option key={m} value={m}>
                        {methodText(m)}
                      </option>
                    ))}
                </select>
              </div>

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
                  {payStatuses
                    .filter((s) => s !== "all")
                    .map((s) => (
                      <option key={s} value={s}>
                        {payText(s)}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Trạng thái đơn hàng</label>
                <select
                  value={editingOrder.orderStatus}
                  onChange={(e) =>
                    setEditingOrder((prev) => ({
                      ...prev,
                      orderStatus: e.target.value,
                    }))
                  }
                >
                  {orderStatuses
                    .filter((s) => s !== "all")
                    .map((s) => (
                      <option key={s} value={s}>
                        {orderText(s)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setEditingOrder(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveEdit}
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
