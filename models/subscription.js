import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';

const Subscription = sequelize.define('Subscription', {
  subscription_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Wholesaler user ID',
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  payment_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Foreign key to payments table (optional enforcement)',
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
