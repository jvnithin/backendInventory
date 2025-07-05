import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
const RetailerInvitation = sequelize.define('RetailerInvitation', {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  invitations: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  }
}, {
  tableName: 'retailer_invitations',
  timestamps: true,
});
export default RetailerInvitation