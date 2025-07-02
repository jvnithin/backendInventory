import { DataTypes } from 'sequelize';
import {sequelize} from '../config/database.js';

const RetailerInvitation = sequelize.define('RetailerInvitation', {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  invitations: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    validate: {
      isArrayOfObjects(value) {
        if (!Array.isArray(value)) throw new Error("Invitations must be an array");
        for (const entry of value) {
          if (
            typeof entry.wholesaler_id !== 'string' ||
            typeof entry.code !== 'string'
          ) {
            throw new Error("Each invitation must contain 'wholesaler_id' and 'code' as strings");
          }
        }
      }
    }
  }
}, {
  tableName: 'retailer_invitations',
  timestamps: true,
});

export default RetailerInvitation;
