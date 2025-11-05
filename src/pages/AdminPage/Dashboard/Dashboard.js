import React from "react";
import styles from "./Dashboard.module.scss";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  // Dữ liệu KPI
  const kpi = [
    { title: "Doanh thu hôm nay", value: "4.230.000₫", delta: "+12%" },
    { title: "Đơn hàng mới", value: "52", delta: "+8%" },
    { title: "Khách hàng mới", value: "31", delta: "+5%" },
    { title: "Tỷ lệ hoàn hàng", value: "2.1%", delta: "-0.5%" },
  ];

  // Dữ liệu biểu đồ doanh thu 6 tháng
  const chartData = [
    { month: "Th1", revenue: 8000 },
    { month: "Th2", revenue: 10500 },
    { month: "Th3", revenue: 9500 },
    { month: "Th4", revenue: 12500 },
    { month: "Th5", revenue: 13200 },
    { month: "Th6", revenue: 15000 },
  ];

  // Dữ liệu Top sản phẩm bán chạy
  const topProducts = [
    { id: 1, name: "Áo Polo Cotton", sold: 320, revenue: 3500000 },
    { id: 2, name: "Quần Jeans Slim Fit", sold: 210, revenue: 4200000 },
    { id: 3, name: "Áo Khoác Gió Nam", sold: 185, revenue: 5600000 },
  ];

  return (
    <div className={styles.dashboard}>
      <h2>📊 Dashboard Tổng quan</h2>

      {/* KPI Cards */}
      <div className={styles.cardGrid}>
        {kpi.map((item, index) => (
          <div key={index} className={styles.card}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{item.title}</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{item.value}</div>
            <div
              style={{
                fontSize: 13,
                color: item.delta.startsWith("-") ? "#ef4444" : "#16a34a",
              }}
            >
              {item.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ doanh thu */}
      <div className={styles.section}>
        <div className={styles.card}>
          <h3>Doanh thu 6 tháng gần nhất</h3>
          <div style={{ height: 300, marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bảng sản phẩm bán chạy */}
        <div className={styles.card}>
          <h3>Top sản phẩm bán chạy</h3>
          <table className={styles.table} style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sold}</td>
                  <td>{p.revenue.toLocaleString("vi-VN")}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
