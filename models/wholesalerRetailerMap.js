import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const WholesalerRetailerMap = sequelize.define('WholesalerRetailerMap', {
  wholesaler_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  group_code :{
    type: DataTypes.STRING,
    allowNull: false,
  },
  retailers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  }
}, {
  tableName: 'wholesaler_retailer_map',
  timestamps: true,
});
export default WholesalerRetailerMap