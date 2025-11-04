require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const usersRouter = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
connectDB();

// Routes
app.use('/api/users', usersRouter);
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/categories', require('./routes/categoryRoutes'));
// app.use('/api/carts', require('./routes/cartRoutes'));
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
