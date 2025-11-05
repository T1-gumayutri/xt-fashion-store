import React, { useMemo, useState } from "react";
import styles from "./AdminUsers.module.scss";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const MOCK_USERS = [
  { id: 1,  name: "John Doe",        email: "john@example.com",     role: "admin",   status: "active",  createdAt: "2025-08-12" },
  { id: 2,  name: "Nguyễn Văn A",    email: "a@ptit.edu.vn",        role: "user",    status: "active",  createdAt: "2025-07-30" },
  { id: 3,  name: "Trần B",          email: "tranb@gmail.com",      role: "user",    status: "blocked", createdAt: "2025-04-21" },
  { id: 4,  name: "Lê C",            email: "le.c@company.com",     role: "user",    status: "active",  createdAt: "2025-06-10" },
  { id: 5,  name: "Phạm D",          email: "pham.d@domain.com",    role: "user",    status: "active",  createdAt: "2025-06-15" },
  { id: 6,  name: "Jane Smith",      email: "jane@shop.vn",         role: "manager", status: "active",  createdAt: "2025-05-04" },
  { id: 7,  name: "Alex",            email: "alex@host.com",        role: "user",    status: "active",  createdAt: "2025-03-19" },
  { id: 8,  name: "Chris Evans",     email: "cevans@mail.com",      role: "user",    status: "blocked", createdAt: "2025-02-09" },
  { id: 9,  name: "Emma Watson",     email: "emma@brand.net",       role: "user",    status: "active",  createdAt: "2025-09-01" },
  { id: 10, name: "Bruce Wayne",     email: "bruce@wayneenterp.io", role: "admin",   status: "active",  createdAt: "2025-01-12" },
];

export default function AdminUsers() {
  const [rows, setRows] = useState(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // state cho modal sửa
  const [editingUser, setEditingUser] = useState(null);

  const roles = useMemo(() => {
    const set = new Set(rows.map((r) => r.role));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const statuses = ["all", "active", "blocked"];

  const filtered = useMemo(() => {
    let data = [...rows];

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
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
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
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

  // mở modal, set user đang sửa
  const handleEdit = (id) => {
    const user = rows.find((u) => u.id === id);
    if (user) {
      setEditingUser({ ...user }); // copy để sửa
    }
  };

  // lưu dữ liệu từ modal
  const handleSaveEdit = () => {
    if (!editingUser) return;
    setRows((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    setEditingUser(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Xóa người dùng này?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className={styles.adminUsers}>
      <h2>Users</h2>

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

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
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
                colSpan={6}
                style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
              >
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            paginated.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>
                  <span className={styles.badge}>{r.role}</span>
                </td>
                <td>
                  <span className={styles.badge}>{r.status}</span>
                </td>
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
                <input type="text" value={editingUser.createdAt} disabled />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setEditingUser(null)}
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
