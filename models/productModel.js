import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mrp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  alternative_names: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Array of alternative product names for better search functionality'
  },
  wholesaler_id: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'products',
  timestamps: true,
});

export default Product;
