import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiSearch, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./AdminTopbar.module.scss";

export default function AdminTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login"); // hoặc "/" tùy bạn muốn
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // tìm kiếm chung trong admin (vd: sản phẩm/đơn hàng/người dùng)
    navigate(`/admin/search?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  };

  return (
    <header className={styles.topbar}>
      {/* LEFT: Search */}
      <div className={styles.left}>
        <form onSubmit={handleSearchSubmit} className={styles.search}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <FiSearch />
          </button>
        </form>
      </div>

      {/* RIGHT: Bell + User */}
      <div className={styles.right}>
        <div className={styles.bellWrap} title="Notifications">
          <FiBell />
          <span className={styles.dot} />
        </div>

        {/* User area giống logic Header.js */}
        <div className={styles.userArea}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                <img
                  src={user.avatar || "/logo192.png"}
                  alt="avatar"
                  className={styles.avatar}
                />
                <div className={styles.meta}>
                  <div className={styles.name}>{user.name || "Admin"}</div>
                  <div className={styles.role}>{user.role || "Administrator"}</div>
                </div>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <FiLogOut /> <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.loginLink}>
              <FiUser /> <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
