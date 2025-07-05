import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';

const Cart = sequelize.define('Cart', {
  cart_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement:true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    
    comment: 'Retailer user ID (one cart per retailer)',
  },
  cart_items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of items in the cart: [{ product_id, quantity, price }, ...]',
  },
}, {
  tableName: 'carts',
  timestamps: true, // includes createdAt and updatedAt automatically
});

export default Cart;
