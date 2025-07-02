import { DataTypes } from 'sequelize';
import {sequelize} from '../config/connectDB.js';

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  access_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
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
  location: {
    type: DataTypes.JSONB,
    allowNull: true,
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
    type: DataTypes.ENUM('wholesaler', 'customer'),
    allowNull: false,
  },
  referral_code: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'users',
  timestamps: false, // Since you're manually handling timestamps
});

export default User;
