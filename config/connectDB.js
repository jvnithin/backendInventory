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
      host: 'localhost', 
      dialect: "postgres",
      logging: false,
    }
  );

  try {
    await sequelizeInstance.authenticate();
    console.log("Connection to the database has been established successfully.");

    // Sync all models here (creates tables if they don't exist)
    await sequelizeInstance.sync({ alter: true }); // or { force: true } to drop & recreate tables
    console.log("All models were synchronized successfully.");

  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  return sequelizeInstance;
};

export const sequelize = await connectDb();  // Await to ensure it's connected before export
export default connectDb;
