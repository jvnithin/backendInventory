import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();
let sequelizeInstance = null;

const connectDb = async () => {
  if (sequelizeInstance) {
    console.log("Using existing database connection.");
    return sequelizeInstance;
  }
 
  sequelizeInstance = new Sequelize(
    process.env.DB_NAME || "inventory_db",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "171816",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
      // dialectOptions: {
      //   ssl: {
      //     require: true,
      //     rejectUnauthorized: false,
      //   },
      // },
    }
  );

  try {
    await sequelizeInstance.authenticate();
    console.log("Connection to the database has been established successfully.");
    await sequelizeInstance.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  return sequelizeInstance;
};

export const sequelize = await connectDb();
export default connectDb;
