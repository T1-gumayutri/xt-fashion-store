const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

// helper: parse date range ?start=2025-10-01&end=2025-11-04 (end exclusive)
function parseRange(q) {
  const start = q.start ? new Date(q.start) : new Date(Date.now() - 90*24*3600*1000); // default 90d
  const end   = q.end   ? new Date(q.end)   : new Date(); // now
  return { start, end };
}

// chỉ tính các trạng thái được coi là doanh thu (tuỳ bạn điều chỉnh)
const REVENUE_STATUSES = ['paid','shipped','delivered','processing'];

exports.kpis = async (req, res, next) => {
  try {
    const { start, end } = parseRange(req.query);

    const match = {
      createdAt: { $gte: start, $lt: end },
      status: { $in: REVENUE_STATUSES }
    };

    const [row] = await Order.aggregate([
      { $match: match },
      {
        $facet: {
          orders:   [ { $count: 'count' } ],
          revenue:  [ { $group: { _id: null, total: { $sum: '$total' } } } ],
          items:    [ { $unwind: '$items' }, { $group: { _id: null, qty: { $sum: '$items.quantity' } } } ],
          customers:[ { $group: { _id: '$userId' } }, { $count: 'distinct' } ],
          daily:    [
            { $group: {
                _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } },
                total: { $sum: '$total' }
              }},
            { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } }
          ]
        }
      }
    ]);

    const totalOrders   = row?.orders?.[0]?.count || 0;
    const totalRevenue  = row?.revenue?.[0]?.total || 0;
    const totalItems    = row?.items?.[0]?.qty || 0;
    const totalCustomers= row?.customers?.[0]?.distinct || 0;
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    res.json({ range: { start, end }, totalOrders, totalRevenue, totalItems, totalCustomers, avgOrderValue, daily: row.daily });
  } catch (e) { next(e); }
};

exports.revenueByPeriod = async (req, res, next) => {
  try {
    const { start, end } = parseRange(req.query);
    const grain = req.query.grain === 'month' ? 'month' : 'day'; // 'day' | 'month'

    const match = {
      createdAt: { $gte: start, $lt: end },
      status: { $in: REVENUE_STATUSES }
    };

    const groupId = grain === 'month'
      ? { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }
      : { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } };

    const data = await Order.aggregate([
      { $match: match },
      { $group: { _id: groupId, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1, ...(grain==='day'? {'_id.d':1}: {}) } }
    ]);

    res.json({ range: { start, end }, grain, data });
  } catch (e) { next(e); }
};

exports.topProducts = async (req, res, next) => {
  try {
    const { start, end } = parseRange(req.query);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '10', 10)));

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, status: { $in: REVENUE_STATUSES } } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          quantity: { $sum: '$items.quantity' },
          revenue:  { $sum: { $multiply: [ '$items.quantity', '$items.price' ] } }
      }},
      { $sort: { quantity: -1 } },
      { $limit: limit },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: {
          _id: 0,
          productId: '$product._id',
          productName: '$product.productName',
          img: { $arrayElemAt: ['$product.img', 0] },
          price: '$product.price',
          quantity: 1,
          revenue: 1
      }}
    ]);

    res.json({ range: { start, end }, items: data });
  } catch (e) { next(e); }
};

exports.topCategories = async (req, res, next) => {
  try {
    const { start, end } = parseRange(req.query);
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, status: { $in: REVENUE_STATUSES } } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'p' } },
      { $unwind: '$p' },
      { $group: {
          _id: '$p.categoryId',
          quantity: { $sum: '$items.quantity' },
          revenue:  { $sum: { $multiply: [ '$items.quantity', '$items.price' ] } }
      }},
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'c' } },
      { $unwind: '$c' },
      { $project: { _id: 0, categoryId: '$c._id', categoryName: '$c.categoryName', quantity: 1, revenue: 1 } },
      { $sort: { revenue: -1 } }
    ]);

    res.json({ range: { start, end }, items: data });
  } catch (e) { next(e); }
};

exports.lowStock = async (req, res, next) => {
  try {
    const threshold = Math.max(0, parseInt(req.query.threshold || '10', 10));
    const items = await Product.find({ inventory: { $lte: threshold } })
      .select('productName inventory img price categoryId')
      .populate('categoryId','categoryName')
      .sort({ inventory: 1, productName: 1 });
    res.json({ threshold, items });
  } catch (e) { next(e); }
};

exports.promoPerformance = async (req, res, next) => {
  try {
    const { start, end } = parseRange(req.query);
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, status: { $in: REVENUE_STATUSES }, promotion: { $ne: null } } },
      { $group: {
          _id: '$promotion.code',
          uses: { $sum: 1 },
          totalDiscount: { $sum: { $ifNull: ['$promotion.discount', 0] } },
          revenueAfterDiscount: { $sum: '$total' }
      }},
      { $sort: { uses: -1 } }
    ]);
    res.json({ range: { start, end }, promotions: data });
  } catch (e) { next(e); }
};

exports.topCustomers = async (req, res, next) => {
  try {
    const { start, end } = parseRange(req.query);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, status: { $in: REVENUE_STATUSES } } },
      { $group: {
          _id: '$userId',
          orders: { $sum: 1 },
          spent:  { $sum: '$total' }
      }},
      { $sort: { spent: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
      { $unwind: '$u' },
      { $project: { _id: 0, userId: '$u._id', email: '$u.email', fullname: '$u.fullname', orders: 1, spent: 1 } }
    ]);

    res.json({ range: { start, end }, customers: data });
  } catch (e) { next(e); }
};
