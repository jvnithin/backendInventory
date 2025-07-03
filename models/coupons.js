import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';

const Coupon = sequelize.define('Coupon', {
  coupon_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Wholesaler or platform ID issuing the coupon',
  },
  threshold_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Minimum order amount required to apply the coupon',
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Flat discount amount or percentage value depending on business rules',
  },
  coupon_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Human-readable name or code for the coupon',
  },
}, {
  tableName: 'coupons',
  timestamps: true,
});

export default Coupon;
