import express from 'express';
import {sequelize} from './config/connectDB.js';
import dotenv from 'dotenv';
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wholesalerRoutes from "./routes/wholesalerRoutes.js";
import retailerRoutes from "./routes/retailerRoutes.js";
dotenv.config();
const app = express();
const PORT = 8000;
app.use(express.json());

// Test route
app.get('/', async (req, res) => {
  res.send("Server running");
});

app.use("/api/auth",authRoutes);
app.use("/api/product",productRoutes);
app.use("/api/wholesaler",wholesalerRoutes);
app.use("/api/retailer",retailerRoutes);
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log('Server running on http://localhost:' + PORT);
    });
  })
  .catch((err) => console.error('DB error:', err));
