import React, { useState, useMemo } from "react";
import styles from "./AdminProducts.module.scss";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Áo Polo Cotton",
    category: "Áo",
    price: 189000,
    stock: 120,
    status: "active",
    createdAt: "2025-09-10",
  },
  {
    id: 2,
    name: "Quần Jeans Slim Fit",
    category: "Quần",
    price: 499000,
    stock: 42,
    status: "active",
    createdAt: "2025-08-20",
  },
  {
    id: 3,
    name: "Áo Khoác Gió Nam",
    category: "Áo",
    price: 799000,
    stock: 10,
    status: "out",
    createdAt: "2025-07-15",
  },
  {
    id: 4,
    name: "Thắt Lưng Da Bò",
    category: "Phụ kiện",
    price: 259000,
    stock: 65,
    status: "active",
    createdAt: "2025-09-01",
  },
  {
    id: 5,
    name: "Giày Sneaker Trắng",
    category: "Phụ kiện",
    price: 899000,
    stock: 0,
    status: "out",
    createdAt: "2025-08-05",
  },
];

export default function AdminProducts() {
  const [rows, setRows] = useState(MOCK_PRODUCTS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // state cho modal Thêm/Sửa
  const [modalProduct, setModalProduct] = useState(null); // object sản phẩm đang thao tác
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit'

  const categories = useMemo(() => {
    const set = new Set(rows.map((r) => r.category));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const statuses = ["all", "active", "out"];

  const filtered = useMemo(() => {
    let data = [...rows];
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (category !== "all") data = data.filter((r) => r.category === category);
    if (status !== "all") data = data.filter((r) => r.status === status);

    data.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (sortKey === "createdAt" || sortKey === "price" || sortKey === "stock") {
        va = typeof va === "string" ? new Date(va).getTime() : va;
        vb = typeof vb === "string" ? new Date(vb).getTime() : vb;
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [rows, query, category, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // mở modal thêm
  const handleAdd = () => {
    const today = new Date().toISOString().slice(0, 10);
    setModalMode("add");
    setModalProduct({
      id: null,
      name: "",
      category: categories.find((c) => c !== "all") || "",
      price: 0,
      stock: 0,
      status: "active",
      createdAt: today,
    });
  };

  // mở modal sửa
  const handleEdit = (id) => {
    const prod = rows.find((r) => r.id === id);
    if (!prod) return;
    setModalMode("edit");
    setModalProduct({ ...prod });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveModal = () => {
    if (!modalProduct) return;
    if (modalMode === "add") {
      const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      const today = new Date().toISOString().slice(0, 10);
      const newProd = { ...modalProduct, id: nextId, createdAt: today };
      setRows((prev) => [newProd, ...prev]);
      setPage(1);
    } else if (modalMode === "edit") {
      setRows((prev) =>
        prev.map((r) => (r.id === modalProduct.id ? modalProduct : r))
      );
    }
    setModalProduct(null);
    setModalMode(null);
  };

  const closeModal = () => {
    setModalProduct(null);
    setModalMode(null);
  };

  const badge = (text, type) => (
    <span className={`${styles.badge} ${styles[type]}`}>{text}</span>
  );

  const statusLabel = (s) => (s === "active" ? "Đang bán" : "Hết hàng");

  return (
    <div className={styles.adminProducts}>
      <h2>Products</h2>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch />
          <input
            placeholder="Tìm theo tên sản phẩm…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className={styles.filterBox}>
          <label>Danh mục</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterBox}>
          <label>Trạng thái</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <button className={styles.addBtn} onClick={handleAdd}>
          <FiPlus /> Thêm sản phẩm
        </button>
      </div>

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>Tên sản phẩm</th>
            <th onClick={() => handleSort("category")}>Danh mục</th>
            <th onClick={() => handleSort("price")}>Giá</th>
            <th onClick={() => handleSort("stock")}>Tồn kho</th>
            <th onClick={() => handleSort("status")}>Trạng thái</th>
            <th onClick={() => handleSort("createdAt")}>Ngày thêm</th>
            <th style={{ width: 120, textAlign: "right" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
              >
                Không có sản phẩm nào
              </td>
            </tr>
          ) : (
            paginated.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.category}</td>
                <td>{r.price.toLocaleString("vi-VN")}₫</td>
                <td>{r.stock}</td>
                <td>{badge(statusLabel(r.status), r.status)}</td>
                <td>{r.createdAt}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleEdit(r.id)}
                    title="Sửa"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(r.id)}
                    title="Xóa"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <FiChevronLeft />
        </button>
        <div className={styles.pageInfo}>
          Trang {page} / {totalPages}
        </div>
        <button
          className={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          <FiChevronRight />
        </button>
      </div>

      {/* Modal Thêm / Sửa sản phẩm */}
      {modalProduct && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {modalMode === "edit" ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </h3>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Tên sản phẩm</label>
                <input
                  type="text"
                  value={modalProduct.name}
                  onChange={(e) =>
                    setModalProduct((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label>Danh mục</label>
                <select
                  value={modalProduct.category}
                  onChange={(e) =>
                    setModalProduct((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                >
                  {categories
                    .filter((c) => c !== "all")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Giá</label>
                <input
                  type="number"
                  min={0}
                  value={modalProduct.price}
                  onChange={(e) =>
                    setModalProduct((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label>Tồn kho</label>
                <input
                  type="number"
                  min={0}
                  value={modalProduct.stock}
                  onChange={(e) =>
                    setModalProduct((prev) => ({
                      ...prev,
                      stock: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label>Trạng thái</label>
                <select
                  value={modalProduct.status}
                  onChange={(e) =>
                    setModalProduct((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  {statuses
                    .filter((s) => s !== "all")
                    .map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Ngày thêm</label>
                <input type="text" value={modalProduct.createdAt} disabled />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={closeModal}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveModal}
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
