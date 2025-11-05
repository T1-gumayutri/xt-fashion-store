import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminPromotions.module.scss";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

function isoToDisplay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function AdminPromotions() {
  const [rows, setRows] = useState([]);

  // ------- bộ lọc + bảng -------
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===================== MODAL: Thêm/Sửa mã giảm giá =====================
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: "",
    desc: "",
    type: "",
    value: "",
    start: "",
    end: "",
    qty: "",
    active: true,
  });
  const [errors, setErrors] = useState({});

  // 🔹 map doc từ backend -> row cho bảng
  const mapPromo = (p) => ({
    id: p._id,
    code: p.code,
    desc: p.desc,
    type: p.type,
    value: p.value,
    qty: p.qty,
    start: isoToDisplay(p.start),
    end: isoToDisplay(p.end),
    status: p.status,
    createdAt: p.createdAt ? p.createdAt.slice(0, 10) : "",
  });

  // 🔹 load danh sách từ DB
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE}/promotions`);
        const promos = (res.data || []).map(mapPromo);
        setRows(promos);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách mã giảm giá");
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const filtered = useMemo(() => {
    let data = [...rows];

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.desc.toLowerCase().includes(q)
      );
    }
    if (type !== "all") data = data.filter((r) => r.type === type);
    if (status !== "all") data = data.filter((r) => r.status === status);

    if (from) data = data.filter((r) => new Date(r.createdAt) >= new Date(from));
    if (to) data = data.filter((r) => new Date(r.createdAt) <= new Date(to));

    data.sort((a, b) => {
      let va = a[sortKey],
        vb = b[sortKey];
      if (["createdAt", "value", "qty"].includes(sortKey)) {
        va = sortKey === "createdAt" ? new Date(va).getTime() : Number(va);
        vb = sortKey === "createdAt" ? new Date(vb).getTime() : Number(vb);
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [rows, query, type, status, from, to, sortKey, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(total, startIdx + pageSize);
  const pageRows = filtered.slice(startIdx, endIdx);

  const formatValue = (r) =>
    r.type === "fixed"
      ? `${r.value.toLocaleString("vi-VN")} đ`
      : `${r.value}%`;

  const typeBadge = (r) => (
    <span
      className={`${styles.badge} ${
        r.type === "fixed" ? styles.fixed : styles.percent
      }`}
    >
      {r.type === "fixed" ? "Cố định" : "Phần trăm"}
    </span>
  );
  const statusBadge = (st) => (
    <span
      className={`${styles.badge} ${
        st === "active" ? styles.active : styles.expired
      }`}
    >
      {st === "active" ? "Đang kích hoạt" : "Hết hạn"}
    </span>
  );

  const resetForm = () => {
    setForm({
      code: "",
      desc: "",
      type: "",
      value: "",
      start: "",
      end: "",
      qty: "",
      active: true,
    });
    setErrors({});
    setEditingId(null);
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Bắt buộc";
    if (!form.type) e.type = "Bắt buộc";
    if (form.value === "" || isNaN(Number(form.value))) e.value = "Bắt buộc";
    if (!form.start) e.start = "Bắt buộc";
    if (!form.end) e.end = "Bắt buộc";
    if (!form.qty || isNaN(Number(form.qty))) e.qty = "Bắt buộc";
    if (form.start && form.end && new Date(form.start) > new Date(form.end)) {
      e.end = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🔹 lưu: nếu có editingId -> PUT, ngược lại -> POST
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      code: form.code.trim(),
      desc: form.desc.trim(),
      type: form.type,
      value: Number(form.value),
      qty: Number(form.qty),
      start: form.start, // 'YYYY-MM-DDTHH:mm'
      end: form.end,
      status: form.active ? "active" : "expired",
    };

    try {
      if (editingId) {
        const res = await axios.put(
          `${API_BASE}/promotions/${editingId}`,
          payload
        );
        const updated = mapPromo(res.data);
        setRows((prev) =>
          prev.map((r) => (r.id === editingId ? updated : r))
        );
      } else {
        const res = await axios.post(`${API_BASE}/promotions`, payload);
        const created = mapPromo(res.data);
        setRows((prev) => [created, ...prev]);
        setPage(1);
      }

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Lưu mã giảm giá thất bại");
    } finally {
      setSaving(false);
    }
  };

  const addPromo = () => {
    resetForm();
    setOpen(true);
  };

  const editPromo = (promo) => {
    setEditingId(promo.id);
    setForm({
      code: promo.code,
      desc: promo.desc,
      type: promo.type,
      value: String(promo.value),
      // promo.start = 'YYYY-MM-DD HH:mm' → input cần 'YYYY-MM-DDTHH:mm'
      start: promo.start.replace(" ", "T"),
      end: promo.end.replace(" ", "T"),
      qty: String(promo.qty),
      active: promo.status === "active",
    });
    setErrors({});
    setOpen(true);
  };

  const deletePromo = async (id) => {
    if (!window.confirm("Xóa mã giảm giá này?")) return;
    try {
      await axios.delete(`${API_BASE}/promotions/${id}`);
      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Xóa mã giảm giá thất bại");
    }
  };

  const jumpTo = (e) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) setPage(n);
  };

  return (
    <div className={styles.promotions}>
      <div className={styles.headerRow}>
        <h2>Quản lý mã giảm giá</h2>
        <button className={styles.addBtn} onClick={addPromo}>
          <FiPlus /> Thêm mã giảm giá
        </button>
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Tìm kiếm mã giảm giá…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <select
          className={styles.select}
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Loại giảm giá</option>
          <option value="percent">Phần trăm</option>
          <option value="fixed">Cố định</option>
        </select>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Trạng thái</option>
          <option value="active">Đang kích hoạt</option>
          <option value="expired">Hết hạn</option>
        </select>
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
        <div className={styles.sortGroup}>
          <label>Sắp xếp theo:</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="code">Mã</option>
            <option value="value">Giá trị</option>
            <option value="qty">Số lượng</option>
            <option value="status">Trạng thái</option>
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
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>mục / trang</span>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 20 }}>Đang tải danh sách mã giảm giá…</div>
      )}
      {error && <div style={{ padding: 20, color: "red" }}>{error}</div>}

      {/* TABLE */}
      {!loading && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 70 }}>STT</th>
                <th>Mã giảm giá</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Số lượng</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th style={{ width: 120, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: 24,
                      color: "#6b7280",
                    }}
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                pageRows.map((r, idx) => (
                  <tr key={r.id}>
                    <td>{startIdx + idx + 1}</td>
                    <td>
                      <span className={styles.code}>{r.code}</span>
                    </td>
                    <td>{typeBadge(r)}</td>
                    <td>{formatValue(r)}</td>
                    <td>{r.qty}</td>
                    <td>{r.start}</td>
                    <td>{r.end}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={styles.iconBtn}
                        title="Sửa"
                        onClick={() => editPromo(r)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.delete}`}
                        title="Xóa"
                        onClick={() => deletePromo(r.id)}
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
      )}

      {/* FOOTER / PAGINATION */}
      {!loading && (
        <div className={styles.footer}>
          <div className={styles.rangeInfo}>
            {total === 0 ? "0-0" : `${startIdx + 1}-${endIdx}`} của {total} mục
          </div>
          <div className={styles.pager}>
            <button
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {"<"}
            </button>
            <div className={styles.pageNow}>{page}</div>
            <button
              className={styles.pageBtn}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {">"}
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
      )}

      {/* ======== MODAL ======== */}
      {open && (
        <div
          className={styles.modalBackdrop}
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>{editingId ? "Sửa mã giảm giá" : "Thêm mã giảm giá mới"}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => !saving && setOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Code */}
              <label className={styles.label}>
                <span className={styles.req}>*</span> Mã giảm giá
              </label>
              <input
                className={`${styles.input} ${
                  errors.code ? styles.error : ""
                }`}
                placeholder="Nhập mã giảm giá (VD: SALE10P)"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
              {errors.code && (
                <div className={styles.errorText}>{errors.code}</div>
              )}

              {/* Desc */}
              <label className={styles.label}>Mô tả</label>
              <textarea
                className={styles.textarea}
                placeholder="Nhập mô tả chi tiết về mã giảm giá"
                rows={4}
                value={form.desc}
                onChange={(e) =>
                  setForm({ ...form, desc: e.target.value })
                }
              />

              {/* Type + Value */}
              <div className={styles.row2}>
                <div>
                  <label className={styles.label}>
                    <span className={styles.req}>*</span> Loại giảm giá
                  </label>
                  <select
                    className={`${styles.input} ${
                      errors.type ? styles.error : ""
                    }`}
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value,
                        value: "",
                      })
                    }
                  >
                    <option value="">Chọn loại giảm giá</option>
                    <option value="percent">Phần trăm</option>
                    <option value="fixed">Cố định</option>
                  </select>
                  {errors.type && (
                    <div className={styles.errorText}>{errors.type}</div>
                  )}
                </div>
                <div>
                  <label className={styles.label}>
                    <span className={styles.req}>*</span> Giá trị
                  </label>
                  <input
                    className={`${styles.input} ${
                      errors.value ? styles.error : ""
                    }`}
                    placeholder={
                      form.type === "fixed"
                        ? "Nhập giá trị (đ)"
                        : "Nhập giá trị (%)"
                    }
                    type="number"
                    min="0"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                    disabled={!form.type}
                  />
                  {errors.value && (
                    <div className={styles.errorText}>{errors.value}</div>
                  )}
                </div>
              </div>

              {/* Date range */}
              <label className={styles.label}>
                <span className={styles.req}>*</span> Thời gian hiệu lực
              </label>
              <div className={styles.row2}>
                <input
                  type="datetime-local"
                  className={`${styles.input} ${
                    errors.start ? styles.error : ""
                  }`}
                  value={form.start}
                  onChange={(e) =>
                    setForm({ ...form, start: e.target.value })
                  }
                />
                <input
                  type="datetime-local"
                  className={`${styles.input} ${
                    errors.end ? styles.error : ""
                  }`}
                  value={form.end}
                  onChange={(e) =>
                    setForm({ ...form, end: e.target.value })
                  }
                />
              </div>
              {(errors.start || errors.end) && (
                <div className={styles.errorText}>
                  {errors.start || errors.end}
                </div>
              )}

              {/* Quantity */}
              <label className={styles.label}>
                <span className={styles.req}>*</span> Số lượng
              </label>
              <input
                type="number"
                min="0"
                className={`${styles.input} ${
                  errors.qty ? styles.error : ""
                }`}
                placeholder="Nhập số lượng mã có thể sử dụng"
                value={form.qty}
                onChange={(e) =>
                  setForm({ ...form, qty: e.target.value })
                }
              />
              {errors.qty && (
                <div className={styles.errorText}>{errors.qty}</div>
              )}

              {/* Status switch */}
              <label className={styles.label}>Trạng thái</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />
                <span className={styles.slider} />
                <span className={styles.switchText}>
                  {form.active ? "Kích hoạt" : "Tắt"}
                </span>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnGhost}
                onClick={() => !saving && setOpen(false)}
              >
                Hủy
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
