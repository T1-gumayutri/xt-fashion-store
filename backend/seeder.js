require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Promotion = require('./models/Promotion');

const { shirtProducts, pantProducts, accessoryProducts, promotions } = require('./data/products');

// Hàm chuyển đổi ngày tháng từ chuỗi "Hết hạn: 31/12/2025"
const parseDate = (str) => {
  try {
    const datePart = str.replace('Hết hạn: ', '').trim();
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}`);
  } catch (e) {
    return new Date();
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const importData = async () => {
  try {
    console.log('1. Đang xóa dữ liệu cũ...');
    await Product.deleteMany();
    await Category.deleteMany();
    await Promotion.deleteMany();

    console.log('2. Đang tạo Danh mục...');
    const categoriesData = [
      { name: 'Áo Xuân Hè', slug: 'ao-xuan-he', img: '/assets/images/ALS1550S2.jpg' },
      { name: 'Quần', slug: 'quan', img: '/assets/images/ASOG22AS4.jpg' },
      { name: 'Phụ Kiện', slug: 'phu-kien', img: '/assets/images/ATW0240Z4.jpg' }
    ];
    const createdCategories = await Category.insertMany(categoriesData);

    const aoID = createdCategories.find(c => c.slug === 'ao-xuan-he')._id;
    const quanID = createdCategories.find(c => c.slug === 'quan')._id;
    const pkID = createdCategories.find(c => c.slug === 'phu-kien')._id;

    console.log('3. Đang nhập Khuyến mãi (Promotions)...');
    const promotionDocs = promotions.map(p => ({
      code: p.code,
      description: p.description,
      type: p.type,
      
      value: p.type === 'shipping' ? 0 : p.value,
      
      minOrderValue: p.minOrderValue || 0,
      maxDiscount: p.maxValue || 0, 
      
      maxUses: p.quantity,
      
      endDate: parseDate(p.expiry),
      startDate: new Date(),
      isActive: true
    }));

    await Promotion.insertMany(promotionDocs);

    console.log('4. Đang xử lý và nhập Sản phẩm...');
    
    const transformProduct = (item, catID) => {
      let variants = [];
      let totalInventory = 0;

      if (item.inventory && item.inventory.length > 0) {
        item.inventory.forEach(inv => {
          const variantImage = (inv.images && inv.images.length > 0) ? inv.images[0] : item.images[0];
          
          if (inv.sizes && inv.sizes.length > 0) {
             inv.sizes.forEach(size => {
                variants.push({
                  color: inv.color,
                  colorHex: inv.colorHex || '#000000',
                  size: size,
                  quantity: 20, 
                  image: variantImage
                });
                totalInventory += 20;
             });
          } else {
             variants.push({
                color: inv.color,
                colorHex: inv.colorHex || '#000000',
                size: 'FREESIZE',
                quantity: 20,
                image: variantImage
             });
             totalInventory += 20;
          }
        });
      }

      let productImages = [];
      if (item.images && item.images.length > 0) {
        productImages = item.images.map(url => ({ url, public_id: null }));
      }

      return {
        productName: item.name,
        price: item.price,
        description: item.fullDescription || 'Đang cập nhật...',
        fullDescription: item.fullDescription,
        categoryId: catID,
        subCategory: item.subCategory,
        img: productImages,
        variants: variants,
        inventory: totalInventory,
        isDefault: true
      };
    };

    const allProducts = [
      ...shirtProducts.map(p => transformProduct(p, aoID)),
      ...pantProducts.map(p => transformProduct(p, quanID)),
      ...accessoryProducts.map(p => transformProduct(p, pkID))
    ];

    for (const productData of allProducts) {
        const product = new Product(productData);
        await product.save(); 
    }

    console.log('TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC NHẬP THÀNH CÔNG!');
    process.exit();

  } catch (error) {
    console.error('Lỗi nhập liệu:', error);
    process.exit(1);
  }
};

importData();