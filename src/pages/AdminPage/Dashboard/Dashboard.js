import React, { useEffect, useState, useCallback } from "react";
import styles from "./Dashboard.module.scss";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  FiCalendar, FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiFilter, FiAlertCircle
} from "react-icons/fi";

import analyticsApi from "../../../api/analyticsApi";
import { useAuth } from "../../../contexts/AuthContext";
import { getImageUrl } from "../../../utils/imageHelper";

// --- COLORS PALETTE ---
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

// --- CUSTOM TOOLTIP (BIỂU ĐỒ VÙNG) ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <div className={styles.tooltipItem}>
          <span className={styles.value}>
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// --- CUSTOM TOOLTIP (BIỂU ĐỒ TRÒN) ---
const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{data.name}</p>
        <div className={styles.tooltipItem}>
          <span className={styles.dot} style={{ background: data.payload.fill }}></span>
          <span className={styles.value}>
            {/* Tự động detect format tiền hay số lượng */}
            {data.value > 1000 
              ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(data.value)
              : new Intl.NumberFormat("vi-VN").format(data.value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  // --- STATE ---
  const [filter, setFilter] = useState({
      type: 'day',
      from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
      to: new Date().toISOString().slice(0, 10)
  });

  const [kpiData, setKpiData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  
  // Data cho các biểu đồ tròn & list
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const formatCurrency = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  // --- FETCH REVENUE CHART ---
  const fetchRevenueChart = useCallback(async () => {
      if (!token) return;
      try {
          const res = await analyticsApi.getRevenue(filter, token);
          const formatted = (res.data.data || []).map(item => ({
              label: item._id, 
              revenue: item.revenue,
              orders: item.orders
          }));
          setChartData(formatted);
      } catch (error) { console.error(error); }
  }, [filter, token]);

  // --- FETCH ALL INITIAL DATA ---
  useEffect(() => {
    const initData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [resKpi, resTopProd, resCat, resStatus, resCust, resStock] = await Promise.all([
           analyticsApi.getKpis(token),
           analyticsApi.getTopProducts(token),
           analyticsApi.getCategoryAnalytics(token),
           analyticsApi.getOrderStatusAnalytics(token),
           analyticsApi.getTopCustomers(token),
           analyticsApi.getLowStock(token)
        ]);

        setKpiData(resKpi.data);
        setTopProducts(resTopProd.data.items || []);
        setCategoryData(resCat.data.data || []); 
        setOrderStatusData(resStatus.data.data || []);
        setTopCustomers(resCust.data.data || []);
        setLowStock(resStock.data.data || []);

      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [token]);

  useEffect(() => { fetchRevenueChart(); }, [fetchRevenueChart]);

  const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });

  const formatXAxis = (tickItem) => {
      if (!tickItem) return "";
      if (filter.type === 'day') {
          const parts = tickItem.split('-'); 
          return parts.length === 3 ? `${parts[2]}/${parts[1]}` : tickItem;
      }
      return tickItem;
  };

  if (loading && !kpiData.totalRevenue) return <div className={styles.loading}>Đang tải dữ liệu...</div>;

  const kpiList = [
    { title: "Doanh Thu", value: formatCurrency(kpiData.totalRevenue), icon: <FiDollarSign />, color: "indigo", trend: `${kpiData.revenueGrowth}%`, trendUp: kpiData.revenueGrowth >= 0 },
    { title: "Đơn Hàng", value: kpiData.totalOrders, icon: <FiShoppingBag />, color: "emerald", trend: `${kpiData.ordersGrowth}%`, trendUp: kpiData.ordersGrowth >= 0 },
    { title: "Khách Hàng", value: kpiData.totalCustomers, icon: <FiUsers />, color: "orange", trend: `${kpiData.customersGrowth}%`, trendUp: kpiData.customersGrowth >= 0 },
    { title: "TB Đơn Hàng", value: formatCurrency(kpiData.avgOrderValue), icon: <FiBox />, color: "blue", trend: "0%", trendUp: true },
  ];

  return (
    <div className={styles.dashboard}>
      {/* HEADER & FILTER */}
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Tổng quan kinh doanh</h2>
          <p className={styles.subtitle}>Báo cáo chi tiết hiệu quả kinh doanh của cửa hàng.</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.filterGroup}>
             <FiFilter />
             <select name="type" value={filter.type} onChange={handleFilterChange}>
                <option value="day">Theo Ngày</option>
                <option value="week">Theo Tuần</option>
                <option value="month">Theo Tháng</option>
             </select>
          </div>
          <div className={styles.datePicker}>
             <FiCalendar />
             <input type="date" name="from" value={filter.from} onChange={handleFilterChange} />
             <span>—</span>
             <input type="date" name="to" value={filter.to} onChange={handleFilterChange} />
          </div>
        </div>
      </header>

      {/* 1. KPI CARDS */}
      <div className={styles.kpiGrid}>
        {kpiList.map((item, index) => (
          <div key={index} className={`${styles.kpiCard} ${styles[item.color]}`}>
            <div className={styles.cardTop}>
              <div className={styles.iconWrapper}>{item.icon}</div>
              <div className={`${styles.trend} ${item.trendUp ? styles.up : styles.down}`}>
                {item.trendUp ? <FiTrendingUp /> : <FiTrendingDown />}
                {item.trend}
              </div>
            </div>
            <div className={styles.cardContent}>
              <h3>{item.value}</h3>
              <p>{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. REVENUE CHART (FULL WIDTH) */}
      <div className={styles.fullWidthSection}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}><h3>Biểu đồ doanh thu</h3></div>
          <div className={styles.chartBody}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tickFormatter={formatXAxis} axisLine={false} tickLine={false} dy={10} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => new Intl.NumberFormat('en', { notation: "compact" }).format(val)}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. INSIGHTS ROW (CATEGORY & ORDER STATUS) */}
      <div className={styles.insightsGrid}>
        
        {/* Doanh thu theo danh mục (Pie Chart) */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}><h3>Doanh thu theo danh mục</h3></div>
          <div className={styles.chartBody}>
             {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                        data={categoryData} 
                        cx="50%" cy="50%" 
                        innerRadius={60} outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="revenue" // backend tra ve field revenue
                        nameKey="_id"     // backend tra ve ten danh muc o field _id
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
             ) : <div className={styles.noData}>Chưa có dữ liệu</div>}
          </div>
        </div>

        {/* Trạng thái đơn hàng (Donut Chart) */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}><h3>Trạng thái đơn hàng</h3></div>
          <div className={styles.chartBody}>
             {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                        data={orderStatusData} 
                        cx="50%" cy="50%" 
                        innerRadius={60} outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
             ) : <div className={styles.noData}>Chưa có dữ liệu</div>}
          </div>
        </div>
      </div>

      {/* 4. DETAILS GRID (LISTS) */}
      <div className={styles.detailsGrid}>
        
        {/* Top Sản phẩm */}
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}><h3>Sản phẩm bán chạy</h3></div>
          <div className={styles.listWrapper}>
            {topProducts.map((p, idx) => {
                const imgUrl = getImageUrl(Array.isArray(p.img) ? p.img[0]?.url : p.img?.url);
                return (
                  <div key={idx} className={styles.listItem}>
                    <div className={styles.rank}>{idx + 1}</div>
                    <img src={imgUrl} alt="" onError={(e) => e.target.src = 'https://via.placeholder.com/40'} />
                    <div className={styles.itemInfo}>
                       <span className={styles.itemName} title={p.productName}>{p.productName}</span>
                       <span className={styles.itemSub}>{p.quantity} đã bán</span>
                    </div>
                    <span className={styles.itemValue}>{formatCurrency(p.revenue)}</span>
                  </div>
                )
            })}
          </div>
        </div>

        {/* Top Khách hàng */}
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}><h3>Khách hàng VIP</h3></div>
          <div className={styles.listWrapper}>
            {topCustomers.map((c, idx) => (
               <div key={idx} className={styles.listItem}>
                  <div className={styles.avatar}>{c.fullname?.charAt(0).toUpperCase()}</div>
                  <div className={styles.itemInfo}>
                     <span className={styles.itemName}>{c.fullname}</span>
                     <span className={styles.itemSub}>{c.ordersCount} đơn hàng</span>
                  </div>
                  <span className={styles.itemValue}>{formatCurrency(c.totalSpent)}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Cảnh báo tồn kho */}
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
             <h3>Sắp hết hàng</h3>
             <span className={styles.badgeWarn}>{lowStock.length}</span>
          </div>
          <div className={styles.listWrapper}>
             {lowStock.length > 0 ? lowStock.map((p, idx) => {
                 const imgUrl = getImageUrl(Array.isArray(p.img) ? p.img[0]?.url : p.img?.url);
                 return (
                   <div key={idx} className={styles.listItem}>
                      <img src={imgUrl} alt="" className={styles.smallImg} />
                      <div className={styles.itemInfo}>
                         <span className={styles.itemName}>{p.productName}</span>
                      </div>
                      <div className={styles.stockBadge}>
                         <FiAlertCircle /> Còn {p.inventory}
                      </div>
                   </div>
                 )
             }) : <div className={styles.emptyState}>Kho hàng ổn định</div>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;