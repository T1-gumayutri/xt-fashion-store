import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import styles from "./AdminProducts.module.scss";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext"; 

const API_BASE = "http://localhost:5000/api";

export default function AdminProducts() {
  const [rows, setRows] = useState([]);            
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filter / sort / page
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // modal thêm / sửa
  const [modalProduct, setModalProduct] = useState(null); 
  const [modalMode, setModalMode] = useState(null);      

  const statuses = ["all", "active", "out"];

  const { token } = useAuth();  

  // Hàm map document DB -> object dùng trong UI
  const mapProduct = (p) => ({
    id: p._id,
    code: p.code,
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    price: p.price,
    stock: p.stock,
    status: p.status,
    images: p.images || [],
    inventory: p.inventory || [],
    fullDescription: p.fullDescription || "",
    createdAt: p.createdAt ? p.createdAt.slice(0, 10) : "",
  });

  // Load products + categories từ backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_BASE}/products`, {
            headers: {
              Authorization: `Bearer ${token || ""}`,     
            },
          }),
          axios.get(`${API_BASE}/categories`, {
            headers: {
              Authorization: `Bearer ${token || ""}`,     
            },
          }),
        ]);

        setRows(prodRes.data.map(mapProduct));
        setCategories(catRes.data); // [{_id, categoryName, slug}]
      } catch (err) {
        console.error(err);
        setError("Không tải được dữ liệu sản phẩm / danh mục.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Danh sách tên category để filter / chọn trong modal
  const categoryOptions = useMemo(
    () => ["all", ...categories.map((c) => c.categoryName)],
    [categories]
  );

  const statusLabel = (s) => (s === "active" ? "Đang bán" : "Hết hàng");

  const filtered = useMemo(() => {
    let data = [...rows];

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter((r) => r.name.toLowerCase().includes(q));
    }

    if (category !== "all") {
      data = data.filter((r) => r.category === category);
    }

    if (status !== "all") {
      data = data.filter((r) => r.status === status);
    }

    // sort
    data.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (["createdAt", "price", "stock"].includes(sortKey)) {
        if (sortKey === "createdAt") {
          va = new Date(a.createdAt).getTime();
          vb = new Date(b.createdAt).getTime();
        }
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
      code: "",
      name: "",
      category: categoryOptions.find((c) => c !== "all") || "",
      subCategory: "",
      price: 0,
      stock: 0,
      status: "active",
      images: [],
      inventory: [
        { color: "", colorHex: "#000000", sizes: [] },
      ],
      fullDescription: "",
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

  // xoá sản phẩm trong DB
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,        
        },
      });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Xóa sản phẩm thất bại.");
    }
  };

  // lưu thông tin trong modal (thêm / sửa)
  const handleSaveModal = async () => {
    if (!modalProduct) return;

    const payload = {
      code: modalProduct.code,
      name: modalProduct.name,
      category: modalProduct.category,
      subCategory: modalProduct.subCategory,
      price: Number(modalProduct.price),
      stock: Number(modalProduct.stock),
      status: modalProduct.status,
      images: modalProduct.images,
      inventory: modalProduct.inventory,
      fullDescription: modalProduct.fullDescription,
    };

    try {
      if (modalMode === "add") {
        const res = await axios.post(`${API_BASE}/products`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,       
          },
        });
        const created = mapProduct(res.data);
        setRows((prev) => [created, ...prev]);
        setPage(1);
      } else if (modalMode === "edit") {
        const res = await axios.put(
          `${API_BASE}/products/${modalProduct.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,      
            },
          }
        );
        const updated = mapProduct(res.data);
        setRows((prev) =>
          prev.map((r) => (r.id === modalProduct.id ? updated : r))
        );
      }

      setModalProduct(null);
      setModalMode(null);
    } catch (err) {
      console.error(err);
      alert("Lưu sản phẩm thất bại.");
    }
  };

  const closeModal = () => {
    setModalProduct(null);
    setModalMode(null);
  };

  const badge = (text, type) => (
    <span className={`${styles.badge} ${styles[type]}`}>{text}</span>
  );

  return (
    <div className={styles.adminProducts}>
      <h2>Quản lý sản phẩm</h2>

      {/* Thông báo lỗi / loading */}
      {error && <div className={styles.error}>{error}</div>}

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
            {categoryOptions.map((c) => (
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
              <option key={s} value={s}>
                {s === "all" ? "Tất cả" : statusLabel(s)}
              </option>
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
            <th style={{ width: 60 }}>STT</th>
            <th onClick={() => handleSort("name")}>Sản phẩm</th>
            <th onClick={() => handleSort("category")}>Danh mục</th>
            <th onClick={() => handleSort("price")}>Giá</th>
            <th onClick={() => handleSort("stock")}>Tồn kho</th>
            <th onClick={() => handleSort("status")}>Trạng thái</th>
            <th onClick={() => handleSort("createdAt")}>Ngày thêm</th>
            <th style={{ width: 150, textAlign: "right" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={7}
                style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
              >
                Đang tải dữ liệu…
              </td>
            </tr>
          ) : paginated.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
              >
                Không có sản phẩm nào
              </td>
            </tr>
          ) : (
            paginated.map((r, index) => (
              <tr key={r.id}>
                <td>
                {(page - 1) * PAGE_SIZE + index + 1}
                </td>
                <td>
                  <div className={styles.productCell}>
                    <span className={styles.productName}>{r.name}</span>
                    <span className={styles.productId}>Mã: {r.code}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.productCell}>
                    <span className={styles.productName}>{r.category}</span>
                    {r.subCategory && (
                      <span className={styles.productId}>Nhóm: {r.subCategory}</span>
                    )}
                  </div>
                </td>
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
              {/* Mã sản phẩm */}
              <div className={styles.field}>
                <label>Mã sản phẩm</label>
                <input
                  type="text"
                  value={modalProduct.code || ""}
                  onChange={(e) =>
                    setModalProduct((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  placeholder="VD: AJNR02"
                />
              </div>

              {/* Tên */}
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

              {/* Danh mục */}
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
                  {categoryOptions
                    .filter((c) => c !== "all")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              {/* SubCategory */}
              <div className={styles.field}>
                <label>Tiểu danh mục (subCategory)</label>
                <input
                  type="text"
                  value={modalProduct.subCategory || ""}
                  onChange={(e) =>
                    setModalProduct((prev) => ({
                      ...prev,
                      subCategory: e.target.value,
                    }))
                  }
                  placeholder="VD: Quần Dài, Áo Polo, Phụ kiện…"
                />
              </div>

              {/* Giá + tồn kho */}
              <div className={styles.fieldRow}>
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
                  <label>Tồn kho tổng</label>
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
              </div>

              {/* Trạng thái */}
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

              {/* Ảnh – mỗi dòng một URL */}
              <div className={styles.field}>
                <label>Hình ảnh (mỗi dòng 1 URL)</label>
                <textarea
                  rows={3}
                  value={(modalProduct.images || []).join("\n")}
                  onChange={(e) => {
                    const arr = e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setModalProduct((prev) => ({ ...prev, images: arr }));
                  }}
                  placeholder="/assets/images/AJNR02.jpg
/assets/images/AJNR02-1.jpg
/assets/images/AJNR02-2.jpg"
                />
              </div>

              {/* Inventory: 1 màu + nhiều size (đơn giản) */}
              <div className={styles.field}>
                <label>Biến thể (màu & size)</label>
                {(() => {
                  const inv =
                    modalProduct.inventory && modalProduct.inventory[0]
                      ? modalProduct.inventory[0]
                      : { color: "", colorHex: "#000000", sizes: [] };

                  return (
                    <>
                      <div className={styles.fieldRow}>
                        <input
                          type="text"
                          placeholder="Màu (VD: Đen)"
                          value={inv.color}
                          onChange={(e) =>
                            setModalProduct((prev) => ({
                              ...prev,
                              inventory: [
                                {
                                  ...inv,
                                  color: e.target.value,
                                },
                              ],
                            }))
                          }
                        />
                        <input
                          type="text"
                          placeholder="#000000"
                          value={inv.colorHex}
                          onChange={(e) =>
                            setModalProduct((prev) => ({
                              ...prev,
                              inventory: [
                                {
                                  ...inv,
                                  colorHex: e.target.value,
                                },
                              ],
                            }))
                          }
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Size, phân cách bởi dấu phẩy. VD: 29,30,31"
                        value={(inv.sizes || []).join(",")}
                        onChange={(e) =>
                          setModalProduct((prev) => ({
                            ...prev,
                            inventory: [
                              {
                                ...inv,
                                sizes: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              },
                            ],
                          }))
                        }
                      />
                    </>
                  );
                })()}
              </div>

              {/* Mô tả chi tiết */}
              <div className={styles.field}>
                <label>Mô tả chi tiết (HTML)</label>
                <textarea
                  rows={6}
                  value={modalProduct.fullDescription || ""}
                  onChange={(e) =>
                    setModalProduct((prev) => ({
                      ...prev,
                      fullDescription: e.target.value,
                    }))
                  }
                  placeholder="<p><strong>Tên sản phẩm:</strong> ...</p>"
                />
              </div>

              {/* Ngày thêm (readonly) */}
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
