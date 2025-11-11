import React from "react";
import styles from "./AdminSidebar.module.scss";
import { NavLink } from "react-router-dom";
import { FiGrid, FiUsers, FiPackage, FiShoppingBag, FiMessageSquare, FiTag} from "react-icons/fi";

const items = [
  { to: "/admin",            label: "Dashboard", icon: <FiGrid />, end: true },
  { to: "/admin/users",      label: "Users",     icon: <FiUsers /> },
  { to: "/admin/products",   label: "Products",  icon: <FiPackage /> },
  { to: "/admin/orders",     label: "Orders",    icon: <FiShoppingBag /> },
    { to: "/admin/reviews",    label: "Reviews",   icon: <FiMessageSquare /> },
  { to: "/admin/promotions", label: "Promotions", icon: <FiTag /> },
];

export default function AdminSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>A</div>
        <span className={styles.brandText}>Administrator</span>
      </div>
      <nav className={styles.menu}>
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              isActive ? `${styles.item} ${styles.active}` : styles.item
            }
          >
            {it.icon}
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
