require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const authRouter = require('./routes/authRoutes');
const usersRouter = require('./routes/userRoutes');
const categoriesRouter = require('./routes/categoryRoutes');
const uploadRouter = require('./routes/uploadRoutes');
const cartsRouter = require('./routes/cartRoutes');
const productsRouter = require('./routes/productRoutes');
const ordersRouter = require('./routes/orderRoutes');
const promotionsRouter = require('./routes/promotionRoutes');
const wishlistsRouter = require('./routes/wishlistRoutes');
const addressesRouter = require('./routes/addressRoutes');
const paymentRouter = require('./routes/paymentRoutes');
// const newsRouter = require('./routes/newsRoutes');
// const messagesRouter = require('./routes/messageRoutes');
const analyticsRouter = require('./routes/analyticsRoutes');
const errorHandler = require('./middleware/errorHandler'); 

const app = express();

// Middleware mặc định
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Lỗi cú pháp JSON:', err.message);
    return res.status(400).json({ msg: 'Dữ liệu gửi lên không đúng định dạng JSON (thiếu dấu phẩy, thừa ngoặc...)' });
  }
  next();
});

// Kết nối MongoDB
connectDB();

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/wishlist', wishlistsRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/payment', paymentRouter);
// app.use('/api/news', newsRouter);
// app.use('/api/messages', messagesRouter);
app.use('/api/analytics', analyticsRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));