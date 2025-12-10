import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./AdminPromotions.module.scss";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import promotionApi from "../../../api/promotionApi";

const formatDisplayDate = (isoString) => {
  if (!isoString) return "--/--";
  return new Date(isoString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatInputDate = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000); 
  return local.toISOString().slice(0, 16);
};

export default function AdminPromotions() {
  const { token } = useAuth(); 
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter & Sort
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal & Form State
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    id: null,
    code: "",
    description: "",
    type: "percent",
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    maxUses: 100,
    startDate: "",
    endDate: "",
    isActive: true,
  };
  const [form, setForm] = useState(initialForm);

  const fetchPromos = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await promotionApi.getAll(token);
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleSave = async () => {
    if (!form.code || !form.endDate || !form.startDate) {
        return toast.warn("Vui lòng điền mã code và thời gian áp dụng!");
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
        return toast.warn("Ngày kết thúc phải sau ngày bắt đầu!");
    }

    setSaving(true);
    try {
        const payload = {
            code: form.code,
            description: form.description,
            type: form.type,
            value: Number(form.value),
            minOrderValue: Number(form.minOrderValue),
            maxDiscount: Number(form.maxDiscount),
            maxUses: Number(form.maxUses),
            startDate: form.startDate,
            endDate: form.endDate,
            isActive: form.isActive
        };

        if (isEdit) {
            await promotionApi.update(form.id, payload, token);
            toast.success("Cập nhật khuyến mãi thành công");
        } else {
            await promotionApi.create(payload, token);
            toast.success("Tạo mã khuyến mãi thành công");
        }
        setOpen(false);
        fetchPromos();
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.msg || "Lỗi khi lưu dữ liệu";
        toast.error(msg);
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
      try {
          await promotionApi.remove(id, token);
          toast.success("Đã xóa mã thành công");
          setRows(prev => prev.filter(r => r.id !== id));
      } catch (error) {
          toast.error("Lỗi khi xóa mã");
      }
  };

  const openAdd = () => {
      setIsEdit(false);
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      setForm({ 
          ...initialForm, 
          startDate: formatInputDate(now.toISOString()),
          endDate: formatInputDate(nextWeek.toISOString())
      });
      setOpen(true);
  };

  const openEdit = (item) => {
      setIsEdit(true);
      setForm({
          id: item.id || item._id,
          code: item.code,
          description: item.description || "",
          type: item.type,
          value: item.value,
          minOrderValue: item.minOrderValue || 0,
          maxDiscount: item.maxDiscount || 0,
          maxUses: item.maxUses,
          startDate: formatInputDate(item.startDate),
          endDate: formatInputDate(item.endDate),
          isActive: item.isActive
      });
      setOpen(true);
  };

  const filteredRows = useMemo(() => {
    let data = [...rows];
    if (query.trim()) {
        const q = query.toLowerCase();
        data = data.filter(r => r.code.toLowerCase().includes(q));
    }
    data.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
    return data;
  }, [rows, query]);

  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div>
            <h2 className={styles.title}>Quản lý mã giảm giá</h2>
            <p className={styles.subtitle}>Tạo và quản lý các chương trình khuyến mãi của shop</p>
        </div>
        <button className={styles.btnAdd} onClick={openAdd}>
          <FiPlus /> Thêm mã mới
        </button>
      </div>

      {/* Toolbar Section */}
      <div className={styles.toolbar}>
          <div className={styles.searchBox}>
             <FiSearch className={styles.searchIcon} />
             <input 
                placeholder="Tìm kiếm mã code..." 
                value={query} 
                onChange={e => {setQuery(e.target.value); setPage(1);}} 
            />
          </div>
      </div>

      {/* Table Section */}
      <div className={styles.tableCard}>
          <table className={styles.table}>
              <thead>
                  <tr>
                      <th width="120">Mã Code</th>
                      <th>Chi tiết ưu đãi</th>
                      <th>Điều kiện</th>
                      <th>Thời gian áp dụng</th>
                      <th>Lượt dùng</th>
                      <th>Trạng thái</th>
                      <th width="100" align="right">Thao tác</th>
                  </tr>
              </thead>
              <tbody>
                  {loading ? (
                      <tr><td colSpan="7" className={styles.loading}>Đang tải dữ liệu...</td></tr>
                  ) : pageRows.length === 0 ? (
                      <tr><td colSpan="7" className={styles.empty}>Chưa có mã giảm giá nào</td></tr>
                  ) : (
                   pageRows.map(r => (
                      <tr key={r.id || r._id}>
                          <td>
                              <span className={styles.codeBadge}>{r.code}</span>
                          </td>
                          <td>
                              <div className={styles.promoValue}>
                                  {r.type === 'percent' ? (
                                      <span className={styles.tagPercent}>{r.value}%</span>
                                  ) : r.type === 'shipping' ? (
                                      <span className={styles.tagShip}>FreeShip</span>
                                  ) : (
                                      <span className={styles.tagFixed}>-{r.value.toLocaleString()}đ</span>
                                  )}
                                  {r.type === 'percent' && r.maxDiscount > 0 && (
                                      <small> (Max {r.maxDiscount.toLocaleString()}đ)</small>
                                  )}
                              </div>
                              <div className={styles.desc}>{r.description}</div>
                          </td>
                          <td>
                              {r.minOrderValue > 0 ? `Đơn từ ${r.minOrderValue.toLocaleString()}đ` : 'Mọi đơn hàng'}
                          </td>
                          <td>
                              <div className={styles.dateInfo}>
                                  <span>{formatDisplayDate(r.startDate)}</span>
                                  <span className={styles.arrow}>➝</span>
                                  <span>{formatDisplayDate(r.endDate)}</span>
                              </div>
                          </td>
                          <td>
                              <div className={styles.usage}>
                                  <strong>{r.usedCount || 0}</strong>
                                  <span className={styles.total}>/{r.maxUses}</span>
                                  <div className={styles.progressBar}>
                                      <div 
                                        style={{width: `${Math.min(100, ((r.usedCount||0)/r.maxUses)*100)}%`}} 
                                      />
                                  </div>
                              </div>
                          </td>
                          <td>
                              <span className={`${styles.statusBadge} ${r.isActive ? styles.active : styles.inactive}`}>
                                  {r.isActive ? 'Đang chạy' : 'Tạm dừng'}
                              </span>
                          </td>
                          <td align="right">
                              <div className={styles.actions}>
                                  <button className={styles.btnIcon} onClick={() => openEdit(r)} title="Sửa"><FiEdit2 /></button>
                                  <button className={`${styles.btnIcon} ${styles.btnDelete}`} onClick={() => handleDelete(r.id || r._id)} title="Xóa"><FiTrash2 /></button>
                              </div>
                          </td>
                      </tr>
                   ))
                  )}
              </tbody>
          </table>
      </div>

      {/* Footer Pagination */}
      <div className={styles.footer}>
          <div className={styles.pageInfo}>
              Hiển thị <strong>{(page-1)*pageSize + 1}-{Math.min(page*pageSize, filteredRows.length)}</strong> trong <strong>{filteredRows.length}</strong> kết quả
          </div>
          <div className={styles.pagination}>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className={styles.pageBtn}>Trước</button>
              <span className={styles.pageNum}>{page}</span>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className={styles.pageBtn}>Sau</button>
          </div>
      </div>

      {/* MODAL FORM */}
      {open && (
        <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{isEdit ? 'Cập nhật mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}</h3>
                    <button className={styles.btnClose} onClick={() => setOpen(false)}><FiX /></button>
                </div>
                
                <div className={styles.modalBody}>
                    {/* Row 1: Mã & Mô tả */}
                    <div className={styles.grid2}>
                        <div className={styles.formGroup}>
                            <label>Mã Code <span className={styles.req}>*</span></label>
                            <input 
                                className={styles.inputCode}
                                value={form.code} 
                                onChange={e => setForm({...form, code: e.target.value.toUpperCase().replace(/\s/g, '')})} 
                                placeholder="VD: SALE50" 
                                disabled={isEdit} 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Trạng thái</label>
                            <div className={styles.toggleSwitch}>
                                <input 
                                    type="checkbox" 
                                    id="activeSwitch"
                                    checked={form.isActive} 
                                    onChange={e => setForm({...form, isActive: e.target.checked})} 
                                />
                                <label htmlFor="activeSwitch">Kích hoạt chương trình</label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mô tả ngắn</label>
                        <input 
                            value={form.description} 
                            onChange={e => setForm({...form, description: e.target.value})} 
                            placeholder="VD: Giảm 50k cho đơn hàng từ 200k..." 
                        />
                    </div>
                    
                    <div className={styles.separator}></div>

                    {/* Row 2: Loại giảm giá */}
                    <div className={styles.grid3}>
                        <div className={styles.formGroup}>
                            <label>Loại ưu đãi</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                <option value="percent">Giảm theo %</option>
                                <option value="fixed">Giảm tiền mặt (VNĐ)</option>
                                <option value="shipping">Miễn phí vận chuyển</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Giá trị giảm</label>
                            <input 
                                type="number" 
                                value={form.value} 
                                onChange={e => setForm({...form, value: e.target.value})} 
                                disabled={form.type === 'shipping'}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Giảm tối đa (VNĐ)</label>
                            <input 
                                type="number" 
                                value={form.maxDiscount} 
                                onChange={e => setForm({...form, maxDiscount: e.target.value})} 
                                disabled={form.type !== 'percent'}
                                placeholder="0 = Không giới hạn"
                            />
                        </div>
                    </div>

                    {/* Row 3: Điều kiện */}
                    <div className={styles.grid2}>
                        <div className={styles.formGroup}>
                            <label>Giá trị đơn tối thiểu</label>
                            <input type="number" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tổng số lượng mã</label>
                            <input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} />
                        </div>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Row 4: Thời gian */}
                    <div className={styles.grid2}>
                        <div className={styles.formGroup}>
                            <label><FiCalendar /> Ngày bắt đầu</label>
                            <input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                        </div>
                        <div className={styles.formGroup}>
                            <label><FiCalendar /> Ngày kết thúc</label>
                            <input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={() => setOpen(false)}>Hủy bỏ</button>
                    <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
                        {saving ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}