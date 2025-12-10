import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUpload,
} from "react-icons/fi";

import productApi from "../../../api/productApi";
import categoryApi from "../../../api/categoryApi";
import uploadApi from "../../../api/uploadApi";
import { getImageUrl } from "../../../utils/imageHelper";
import { useAuth } from "../../../contexts/AuthContext";

import styles from "./AdminProducts.module.scss";

const initialFormState = {
  productName: "",
  categoryId: "",
  subCategory: "",
  price: 0,
  description: "",
  fullDescription: "",
  img: [],
  variants: [],
  isDefault: true,
  inventory: 0,
};

const AdminProducts = () => {
  const { token, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [uploading, setUploading] = useState(false);

  // ===== 1. LOAD DATA =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          productApi.getAll({ limit: 1000 }),
          categoryApi.getAll(),
        ]);

        const prodRaw = resProd.data?.products || [];

        const mappedProducts = prodRaw.map((p) => ({
          ...p,
          id: p.id || p._id,
          categoryId:
            p.categoryId?._id || p.categoryId?.id || p.categoryId || "",
        }));

        const catRaw = resCat.data || [];
        const mappedCats = catRaw.map((c) => ({
          ...c,
          id: c.id || c._id,
        }));

        setProducts(mappedProducts);
        setCategories(mappedCats);
      } catch (error) {
        console.error(error);
        toast.error("Lỗi tải dữ liệu sản phẩm / danh mục");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== 2. UPLOAD ẢNH =====
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!token || user?.role !== "admin") {
      toast.error("Bạn không có quyền upload ảnh (cần admin)");
      return;
    }

    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append("images", files[i]);
    }

    setUploading(true);
    try {
      const res = await uploadApi.uploadImages(uploadData, token);
      // backend: { images: [{ url, public_id }, ...] }
      const newImages = res.data?.images || [];
      setFormData((prev) => ({
        ...prev,
        img: [...prev.img, ...newImages],
      }));
      toast.success("Upload ảnh thành công");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  // ===== 3. SUBMIT (THÊM / SỬA) =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || user?.role !== "admin") {
      toast.error("Bạn không có quyền thao tác sản phẩm (cần admin)");
      return;
    }

    const payload = { ...formData };

    if (payload.fullDescription) {
        const plainText = payload.fullDescription.replace(/<[^>]+>/g, '');
        payload.description = plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '');
    }

    try {
      if (isEditMode) {
        await productApi.update(formData.id, formData, token);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await productApi.create(formData, token);
        toast.success("Thêm mới sản phẩm thành công");
      }

      // Reload list
      const res = await productApi.getAll({ limit: 1000 });
      const prodRaw = res.data?.products || [];
      const mappedProducts = prodRaw.map((p) => ({
        ...p,
        id: p.id || p._id,
        categoryId:
          p.categoryId?._id || p.categoryId?.id || p.categoryId || "",
      }));
      setProducts(mappedProducts);

      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Có lỗi xảy ra khi lưu sản phẩm");
    }
  };

  const handleAddFromUrl = () => {
    if (!imageUrlInput.trim()) {
        toast.warn("Vui lòng nhập đường dẫn ảnh!");
        return;
    }

    const newImage = {
        url: imageUrlInput.trim(),
        public_id: null
    };

    setFormData(prev => ({
        ...prev,
        img: [...prev.img, newImage]
    }));

    setImageUrlInput("");
    toast.success("Đã thêm ảnh từ link!");
};

  // ===== 4. XOÁ SẢN PHẨM =====
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    if (!token || user?.role !== "admin") {
      toast.error("Bạn không có quyền xoá sản phẩm (cần admin)");
      return;
    }

    try {
      await productApi.remove(id, token);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Lỗi khi xóa sản phẩm");
    }
  };

  // ===== MODAL HELPERS =====
  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      ...product,
      id: product.id || product._id,
      categoryId:
        product.categoryId?._id ||
        product.categoryId?.id ||
        product.categoryId ||
        "",
      variants: product.variants || [],
      img: product.img || [],
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      img: prev.img.filter((_, i) => i !== index),
    }));
  };

  // ===== FILTER =====
  const filteredProducts = products.filter((p) => {
    const matchName = p.productName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCat =
      selectedCategory === "All" ||
      p.categoryId?.toString() === selectedCategory;
    return matchName && matchCat;
  });

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý Sản phẩm</h2>
        <button className={styles.addBtn} onClick={openAddModal}>
          <FiPlus /> Thêm mới
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch />
          <input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.catFilter}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>
                  <img
                    src={p.img?.[0] ? getImageUrl(p.img[0].url) : ""}
                    alt=""
                    className={styles.thumb}
                  />
                </td>
                <td className={styles.nameCell}>
                  <span className={styles.name}>{p.productName}</span>
                  <span className={styles.sub}>{p.subCategory}</span>
                </td>
                <td>
                  {
                    categories.find((c) => c.id === p.categoryId)?.name ??
                    "---"
                  }
                </td>
                <td>{p.price?.toLocaleString("vi-VN")}đ</td>
                <td>{p.inventory}</td>
                <td>
                  <button
                    className={styles.iconBtn}
                    onClick={() => openEditModal(p)}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.delete}`}
                    onClick={() => handleDelete(p.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                  Không có sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* Thông tin chung */}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tên sản phẩm</label>
                  <input
                    required
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Danh mục</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Kiểu dáng (SubCategory)</label>
                  <input
                    value={formData.subCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, subCategory: e.target.value })
                    }
                    placeholder="VD: Polo, Jeans..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Giá bán</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Ảnh */}
              <div className={styles.formGroup}>
                <label>Hình ảnh</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input 
                      type="text" 
                      placeholder="Dán link ảnh online (VD: https://imgur.com/...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      style={{ flex: 1 }}
                  />
                  <button 
                      type="button" 
                      onClick={handleAddFromUrl}
                      className={styles.addBtn}
                      style={{ whiteSpace: 'nowrap' }}
                  >
                      Thêm Link
                  </button>
              </div>
                <div className={styles.imageUpload}>
                  {formData.img.map((img, idx) => (
                    <div key={idx} className={styles.imgPreview}>
                      <img src={getImageUrl(img.url)} alt="" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                  <label className={styles.uploadBtn}>
                    {uploading ? "..." : (
                      <>
                        <FiUpload /> Upload
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      onChange={handleUpload}
                      hidden
                    />
                  </label>
                </div>
              </div>

              {/* Variants */}
              <div className={styles.formGroup}>
                <label>Biến thể (Size / Màu)</label>
                {formData.variants.map((v, idx) => (
                  <div key={idx} className={styles.variantRow}>
                    <input
                      placeholder="Size"
                      value={v.size}
                      onChange={(e) =>
                        handleVariantChange(idx, "size", e.target.value)
                      }
                    />
                    <input
                      placeholder="Màu"
                      value={v.color}
                      onChange={(e) =>
                        handleVariantChange(idx, "color", e.target.value)
                      }
                    />
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        placeholder="#000000" 
                        value={v.colorHex} 
                        onChange={e => handleVariantChange(idx, 'colorHex', e.target.value)} 
                        className={styles.hexInput}
                      />
                      
                      <input 
                        type="color" 
                        value={v.colorHex || '#000000'} 
                        onChange={e => handleVariantChange(idx, 'colorHex', e.target.value)} 
                        className={styles.colorInput}
                        title="Chọn màu nhanh"
                      />
                  </div>
                    <input
                      type="number"
                      placeholder="Số lượng"
                      value={v.quantity}
                      onChange={(e) =>
                        handleVariantChange(
                          idx,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className={styles.removeVar}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addVarBtn}
                  onClick={addVariant}
                >
                  + Thêm biến thể
                </button>
              </div>

              {/* Mô tả */}
              <div className={styles.formGroup}>
                <label>Mô tả chi tiết (HTML)</label>
                <textarea
                  rows="5"
                  value={formData.fullDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullDescription: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ===== HELPER FUNCTIONS (TRONG COMPONENT) =====
  function handleVariantChange(index, field, value) {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  }

  function addVariant() {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { size: "", color: "", colorHex: "", quantity: 0, images: "" },
      ],
    });
  }

  function removeVariant(index) {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  }
};

export default AdminProducts;
