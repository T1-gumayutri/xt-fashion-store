import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminUsers.module.scss";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { useAuth } from "../../../contexts/AuthContext";
import userApi from "../../../api/userApi";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const res = await userApi.getAllUsers(token);
        const raw = res.data || res.users || res.data?.users || [];

        const users = (Array.isArray(raw) ? raw : []).map((u) => ({
          ...u,
          id: u.id,
          name: u.fullname || u.name || "",
          email: u.email || "",
          role: u.role || "user",
          status: u.isBlocked ? "blocked" : "active",
          createdAt: u.createdAt || "",
        }));

        setRows(users);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const roles = useMemo(() => {
    const set = new Set(rows.map((r) => r.role || "user"));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const statuses = ["all", "active", "blocked"];

  const filtered = useMemo(() => {
    let data = [...rows];

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== "all") {
      data = data.filter((r) => r.role === roleFilter);
    }

    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    data.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];

      if (sortKey === "createdAt") {
        va = va ? new Date(va).getTime() : 0;
        vb = vb ? new Date(vb).getTime() : 0;
      } else {
        va = String(va ?? "").toLowerCase();
        vb = String(vb ?? "").toLowerCase();
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [rows, query, roleFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const onChangeSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleEdit = (id) => {
    const user = rows.find((u) => u.id === id);
    if (user) {
      setEditingUser({ ...user });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      setSaving(true);
      setError("");

      const payload = {
        fullname: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        isBlocked: editingUser.status === "blocked",
      };

      const res = await userApi.updateUserById(
        token,
        editingUser.id,
        payload
      );
      const updated = res.data || res;

      setRows((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                ...updated,
                id: updated.id || editingUser.id,
                name: updated.fullname || updated.name || editingUser.name,
                role: updated.role || editingUser.role,
                status: updated.isBlocked ? "blocked" : "active",
                createdAt: updated.createdAt || u.createdAt,
              }
            : u
        )
      );

      toast.success("Cập nhật người dùng thành công");
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setError("Không lưu được thay đổi người dùng");
      toast.error("Không lưu được thay đổi người dùng");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await userApi.deleteUserById(token, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Đã xóa người dùng thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa người dùng!");
    }
  };

  return (
    <div className={styles.adminUsers}>
      <h2>Quản lý người dùng</h2>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Search */}
        <div className={styles.searchBox}>
          <FiSearch />
          <input
            placeholder="Tìm theo tên hoặc email…"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />
        </div>

        {/* Role filter */}
        <div className={styles.filterBox}>
          <label>Role</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className={styles.filterBox}>
          <label>Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className={styles.message}>Đang tải danh sách người dùng...</div>
      )}
      {error && <div className={styles.error}>{error}</div>}

      {/* Table */}
      {!loading && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>STT</th>
              <th onClick={() => onChangeSort("name")}>Tên</th>
              <th onClick={() => onChangeSort("email")}>Email</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th onClick={() => onChangeSort("createdAt")}>Ngày tạo</th>
              <th style={{ width: 120, textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
              paginated.map((r, index) => (
                <tr key={r.id}>
                  <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>
                    <span className={styles.badge}>{r.role}</span>
                  </td>
                  <td>
                    <span className={styles.badge}>{r.status}</span>
                  </td>
                  <td>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString("vi-VN")
                      : "N/A"}
                  </td>
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
      )}

      {/* Pagination */}
      {!loading && (
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
      )}

      {/* Modal chỉnh sửa User */}
      {editingUser && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Sửa thông tin người dùng</h3>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Tên</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label>Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                >
                  {roles
                    .filter((r) => r !== "all")
                    .map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Trạng thái</label>
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  {statuses
                    .filter((s) => s !== "all")
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Ngày tạo</label>
                <input
                  type="text"
                  value={
                    editingUser.createdAt
                      ? new Date(editingUser.createdAt).toLocaleString("vi-VN")
                      : "N/A"
                  }
                  disabled
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setEditingUser(null)}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveEdit}
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
