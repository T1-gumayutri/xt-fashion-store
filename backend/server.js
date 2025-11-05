require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const usersRouter = require('./routes/userRoutes');
const categoriesRouter = require('./routes/categoryRoutes');
const cartsRouter = require('./routes/cartRoutes');
const productsRouter = require('./routes/productRoutes');
const ordersRouter = require('./routes/orderRoutes');
const newsRouter = require('./routes/newsRoutes');
const messagesRouter = require('./routes/messageRoutes');
const analyticsRouter = require('./routes/analyticsRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
connectDB();

// Routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/news', newsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/analytics', analyticsRouter);


// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/promotions', require('./routes/promotionRoutes'));
// app.use('/api/news', require('./routes/newsRoutes'));
// app.use('/api/messages', require('./routes/messageRoutes'));
// app.use('/api/chatlogs', require('./routes/chatLogRoutes'));
// app.use('/api/behaviors', require('./routes/userBehaviorRoutes'));

// Middleware xử lý lỗi cuối cùng
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
