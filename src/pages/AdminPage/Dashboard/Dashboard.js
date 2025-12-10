import React, { useEffect, useState } from "react";
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

// Import API & Context
import analyticsApi from "../../../api/analyticsApi";
import { useAuth } from "../../../contexts/AuthContext";

const Dashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  // State lưu dữ liệu
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    avgOrderValue: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song 3 API
        const [resKpi, resRevenue, resTopProd] = await Promise.all([
          analyticsApi.getKpis(token),
          analyticsApi.getRevenue('month', token),
          analyticsApi.getTopProducts(token)
        ]);

        // 1. KPI
        setKpiData({
            totalRevenue: resKpi.data.totalRevenue,
            totalOrders: resKpi.data.totalOrders,
            totalUsers: resKpi.data.totalCustomers,
            avgOrderValue: resKpi.data.avgOrderValue
        });

        // 2. Chart
        const formattedChart = resRevenue.data.data.map(item => ({
            month: `Th${item._id.m}`, 
            revenue: item.revenue
        }));
        setChartData(formattedChart);

        // 3. Top Products
        setTopProducts(resTopProd.data.items);

      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  // List KPI để map ra giao diện
  const kpiList = [
    { 
      title: "DOANH THU", 
      value: formatCurrency(kpiData.totalRevenue), 
      delta: "+12%", 
      isPositive: true 
    },
    { 
      title: "ĐƠN HÀNG", 
      value: kpiData.totalOrders, 
      delta: "+5%", 
      isPositive: true 
    },
    { 
      title: "KHÁCH HÀNG MỚI", 
      value: kpiData.totalUsers, 
      delta: "+2%", 
      isPositive: true 
    },
    { 
      title: "GIÁ TRỊ TB/ĐƠN", 
      value: formatCurrency(kpiData.avgOrderValue), 
      delta: "-1%", 
      isPositive: false 
    },
  ];

  if (loading) return <div style={{padding: '24px'}}>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.dashboard}>
      <h2>Dashboard Tổng quan</h2>

      {/* 1. KPI Cards */}
      <div className={styles.cardGrid}>
        {kpiList.map((item, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.subTitle}>{item.title}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a' }}>
                {item.value}
            </div>
            {/* Class động dựa trên tăng/giảm */}
            <div className={item.isPositive ? styles.positive : styles.negative}>
              {item.delta} <span style={{fontWeight: 400, color: '#64748b', fontSize: 13}}>so với tháng trước</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Biểu đồ & Bảng */}
      <div className={styles.section}>
        
        {/* Biểu đồ doanh thu */}
        <div className={styles.card}>
          <h3>Doanh thu 6 tháng gần nhất</h3>
          <div style={{ height: 300, marginTop: 10 }}>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12}} 
                            tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact" }).format(value)}
                        />
                        <Tooltip 
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', height: '100%', color: '#999'}}>
                    Chưa có dữ liệu
                </div>
            )}
          </div>
        </div>

        {/* Bảng Top Sản Phẩm */}
        <div className={styles.card}>
          <h3>Top sản phẩm bán chạy</h3>
          <div style={{overflowX: 'auto'}}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th style={{textAlign: 'center'}}>Đã bán</th>
                    <th style={{textAlign: 'right'}}>Doanh thu</th>
                </tr>
                </thead>
                <tbody>
                {topProducts.length > 0 ? (
                    topProducts.map((p, index) => (
                        <tr key={index}>
                            <td>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    {/* Ảnh nhỏ */}
                                    <img 
                                        src={p.img ? (p.img.url.startsWith('http') ? p.img.url : `http://localhost:5000${p.img.url}`) : 'https://via.placeholder.com/40'} 
                                        alt="" 
                                        style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}}
                                    />
                                    <span style={{fontWeight: 500, color: '#0f172a'}}>
                                        {p.productName}
                                    </span>
                                </div>
                            </td>
                            <td style={{textAlign: 'center', fontWeight: 600}}>
                                {p.quantity}
                            </td>
                            <td style={{textAlign: 'right', fontWeight: 600, color: '#0f172a'}}>
                                {formatCurrency(p.revenue)}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="3" style={{textAlign:'center', padding: 20}}>Chưa có dữ liệu bán hàng</td></tr>
                )}
                </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;