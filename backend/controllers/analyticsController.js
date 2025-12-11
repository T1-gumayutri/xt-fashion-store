const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const calculateGrowth = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
};

const getMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    return { startOfMonth, startOfLastMonth, endOfLastMonth, now };
};

// 1. KPI CAO CẤP (Có so sánh % với tháng trước)
exports.getKpis = async (req, res) => {
    try {
        const { startOfMonth, startOfLastMonth, endOfLastMonth, now } = getMonthRange();

        // 1. DOANH THU
        const revenueCurrent = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth }, status: { $in: ['paid', 'delivered', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const revenueLast = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $in: ['paid', 'delivered', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        // 2. ĐƠN HÀNG
        const ordersCurrent = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });
        const ordersLast = await Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });

        // 3. KHÁCH HÀNG MỚI
        const customersCurrent = await User.countDocuments({ createdAt: { $gte: startOfMonth }, role: 'user' });
        const customersLast = await User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, role: 'user' });

        // Tính toán số liệu
        const currentRev = revenueCurrent[0]?.total || 0;
        const lastRev = revenueLast[0]?.total || 0;

        // Tính trung bình giá trị đơn (AOV)
        const avgOrderValue = ordersCurrent > 0 ? Math.round(currentRev / ordersCurrent) : 0;
        
        // Trả về dữ liệu kèm % tăng trưởng
        res.json({
            totalRevenue: currentRev,
            revenueGrowth: calculateGrowth(currentRev, lastRev),
            
            totalOrders: ordersCurrent,
            ordersGrowth: calculateGrowth(ordersCurrent, ordersLast),

            totalCustomers: customersCurrent,
            customersGrowth: calculateGrowth(customersCurrent, customersLast),

            avgOrderValue: avgOrderValue
        });

    } catch (err) {
        console.error("KPI Error:", err);
        res.status(500).json({ msg: 'Lỗi lấy KPI' });
    }
};

// 2. BIỂU ĐỒ DOANH THU (Day/Week/Month)
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const { type = 'day', from, to } = req.query;
        
        let end = to ? new Date(to) : new Date();
        end.setHours(23, 59, 59, 999);
        let start = from ? new Date(from) : new Date(new Date().setDate(end.getDate() - 30));
        start.setHours(0, 0, 0, 0);

        let groupId, sortId;
        if (type === 'month') {
            groupId = { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } };
            sortId = { '_id.y': 1, '_id.m': 1 };
        } else if (type === 'week') {
            groupId = { y: { $isoWeekYear: '$createdAt' }, w: { $isoWeek: '$createdAt' } };
            sortId = { '_id.y': 1, '_id.w': 1 };
        } else {
            groupId = { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } };
            sortId = { '_id.y': 1, '_id.m': 1, '_id.d': 1 };
        }

        const data = await Order.aggregate([
            { $match: { 
                createdAt: { $gte: start, $lte: end }, 
                status: { $in: ['paid', 'delivered', 'completed'] }
            }},
            { $group: { _id: groupId, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
            { $sort: sortId }
        ]);

        const formatted = data.map(i => {
            const { y, m, d, w } = i._id;
            let label = type === 'month' ? `${y}-${m}` : type === 'week' ? `${y}-W${w}` : `${y}-${m}-${d}`;
            return { _id: label, revenue: i.revenue, orders: i.orders };
        });

        res.json({ data: formatted });
    } catch (err) {
        res.status(500).json({ msg: 'Lỗi Revenue Analytics' });
    }
};

// 3. TOP SẢN PHẨM BÁN CHẠY
exports.getTopProducts = async (req, res) => {
    try {
        const data = await Order.aggregate([
            { $match: { status: { $in: ['paid', 'delivered', 'completed'] } } },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.productId',
                quantity: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }},
            { $sort: { quantity: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
            { $unwind: '$p' },
            { $project: {
                productName: '$p.productName',
                img: { $arrayElemAt: ['$p.img', 0] },
                quantity: 1,
                revenue: 1
            }}
        ]);
        res.json({ items: data });
    } catch (err) {
        res.status(500).json({ msg: 'Lỗi Top Products' });
    }
};

// 4. PHÂN TÍCH DANH MỤC
exports.getCategoryAnalytics = async (req, res) => {
    try {
        const data = await Order.aggregate([
            { $match: { status: { $in: ['paid', 'delivered', 'completed'] } } },
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'prod' } },
            { $unwind: '$prod' },
            { $lookup: { from: 'categories', localField: 'prod.categoryId', foreignField: '_id', as: 'cat' } },
            { $unwind: '$cat' },
            { $group: {
                _id: '$cat.categoryName',
                value: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }},
            { $sort: { revenue: -1 } }
        ]);
        res.json({ data });
    } catch (err) {
        res.status(500).json({ msg: 'Lỗi Category Analytics' });
    }
};

// 5. TÌNH TRẠNG ĐƠN HÀNG
exports.getOrderStatusAnalytics = async (req, res) => {
    try {
        const data = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const formatted = data.map(i => ({ name: i._id, value: i.count }));
        res.json({ data: formatted });
    } catch (err) {
        res.status(500).json({ msg: 'Lỗi Order Status' });
    }
};

// 6. TOP KHÁCH HÀNG CHI TIÊU NHIỀU
exports.getTopCustomers = async (req, res) => {
    try {
        const data = await Order.aggregate([
            { $match: { status: { $in: ['paid', 'delivered', 'completed'] } } },
            { $group: { 
                _id: '$userId', 
                totalSpent: { $sum: '$total' }, 
                ordersCount: { $sum: 1 } 
            }},
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: {
                fullname: '$user.fullname',
                email: '$user.email',
                totalSpent: 1,
                ordersCount: 1
            }}
        ]);
        res.json({ data });
    } catch (err) {
        res.status(500).json({ msg: 'Lỗi Top Customers' });
    }
};

// 7. CẢNH BÁO TỒN KHO
exports.getLowStock = async (req, res) => {
    try {
        const products = await Product.find({ inventory: { $lte: 10 } })
            .select('productName inventory img')
            .limit(5);
        res.json({ data: products });
    } catch (err) {
        res.status(500).json({ msg: 'Lỗi Low Stock' });
    }
};