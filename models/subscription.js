import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';

const Subscription = sequelize.define('Subscription', {
  subscription_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement:true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Wholesaler user ID',
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => {
      const now = new Date();
      now.setDate(now.getDate() + 7);
      return now;
    }
  },
  payment_id: {
    type: DataTypes.STRING,
    // allowNull: false,
    comment: 'Foreign key to payments table (optional enforcement)',
    default:"initial"
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Used to trigger email/notifications while active',
  },
  iscompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indicates whether this subscription has ended',
  },
}, {
  tableName: 'subscriptions',
  timestamps: true,
});

export default Subscription;
