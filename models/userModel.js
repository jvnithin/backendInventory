import { DataTypes } from 'sequelize';
import {sequelize} from '../config/connectDB.js';

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(15), // VARCHAR(255) in DB, but validating typical length
    allowNull: true,
    validate: {
      is: {
        args: [/^\d{10,15}$/],
        msg: "Phone must be 10-15 digits",
      },
    },
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('wholesaler','retailer','admin'),
    allowNull: false,
  },
  isdeactivated:{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
});

export default User;
