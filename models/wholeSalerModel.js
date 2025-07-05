import { DataTypes } from 'sequelize';
import {sequelize} from '../config/connectDB.js';

const WholesalerCode = sequelize.define('WholesalerCode', {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  group_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
}, {
  tableName: 'wholesaler_code',
  timestamps: true,
});
export default WholesalerCode;
