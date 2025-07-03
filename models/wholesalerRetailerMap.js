const WholesalerRetailerMap = sequelize.define('WholesalerRetailerMap', {
  mapping: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidMap(value) {
        if (typeof value !== 'object' || value === null) {
          throw new Error("Mapping must be a JSON object");
        }
        for (const [key, val] of Object.entries(value)) {
          if (!Array.isArray(val) || val.some(id => typeof id !== 'string')) {
            throw new Error("Each key must map to an array of retailer IDs (strings)");
          }
        }
      }
    }
  }
}, {
  tableName: 'wholesaler_retailer_map',
  timestamps: true,
});
