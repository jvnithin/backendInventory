import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Related order ID if this payment is for an order',
  },
  subscription_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Related subscription ID if this payment is for a subscription',
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'ID of the user (wholesaler or retailer)',
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Role of the user (e.g., wholesaler, retailer)',
  },
  status: {
    type: DataTypes.ENUM('pending', 'successful', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'payments',
  timestamps: false, // manually managing created_at
});

export default Payment;
