const Address = require('../models/Address');

// GET /api/addresses
exports.getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// POST /api/addresses
exports.addAddress = async (req, res) => {
  try {
    const { recipientName, phoneNumber, street, ward, district, city, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { userId: req.user._id },
        { isDefault: false }
      );
    }

    const newAddress = new Address({
      userId: req.user._id,
      recipientName,
      phoneNumber,
      street,
      ward,
      district,
      city,
      isDefault: isDefault || false
    });

    const count = await Address.countDocuments({ userId: req.user._id });
    if (count === 0) {
      newAddress.isDefault = true;
    }

    await newAddress.save();
    res.status(201).json(newAddress);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// PUT /api/addresses/:id
exports.updateAddress = async (req, res) => {
  try {
    const { recipientName, phoneNumber, street, ward, district, city, isDefault } = req.body;
    const addressId = req.params.id;

    const address = await Address.findOne({ _id: addressId, userId: req.user._id });
    if (!address) return res.status(404).json({ msg: 'Không tìm thấy địa chỉ' });

    if (isDefault) {
       await Address.updateMany(
        { userId: req.user._id },
        { isDefault: false }
      );
    }

    address.recipientName = recipientName || address.recipientName;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.street = street || address.street;
    address.ward = ward || address.ward;
    address.district = district || address.district;
    address.city = city || address.city;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();
    res.json(address);

  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// DELETE /api/addresses/:id
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user._id;

    const deletedAddress = await Address.findOneAndDelete({ _id: addressId, userId: userId });
    
    if (!deletedAddress) {
        return res.status(404).json({ msg: 'Không tìm thấy địa chỉ' });
    }

    if (deletedAddress.isDefault) {
        const nextAddress = await Address.findOne({ userId: userId }).sort({ createdAt: -1 });
        
        if (nextAddress) {
            nextAddress.isDefault = true;
            await nextAddress.save();
        }
    }

    res.json({ msg: 'Đã xóa địa chỉ thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};