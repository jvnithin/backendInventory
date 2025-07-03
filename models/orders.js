import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Retailer or wholesaler user ID',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  order_items: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array of ordered items with quantity, price, etc.',
  },
  status: {
    type: DataTypes.ENUM('pending', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Delivery address including lat/lng for map view on wholesaler app',
  },
}, {
  tableName: 'orders',
  timestamps: false, // created_at is managed manually
});

export default Order;
