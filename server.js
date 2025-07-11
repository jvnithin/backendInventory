import express from 'express';
import { sequelize } from './config/connectDB.js';
import dotenv from 'dotenv';
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wholesalerRoutes from "./routes/wholesalerRoutes.js";
import retailerRoutes from "./routes/retailerRoutes.js";
import cors from 'cors';
import adminRoutes from "./routes/adminRoutes.js";
import http from 'http';                
import { Server as SocketIOServer } from 'socket.io'; 
import socketController from './socket/socketController.js';
import Subscription from './models/subscription.js';
import paymentRoutes from "./routes/paymentRoutes.js";
dotenv.config();
const app = express();
app.use(cors());
const PORT = 8000;
app.use(express.json());

// Test route
app.get('/', async (req, res) => {
  res.send("Server running");
});

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/wholesaler", wholesalerRoutes);
app.use("/api/retailer", retailerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment",paymentRoutes)
// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Adjust as needed for security
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handler
io.on('connection', socketController);
export default io;
// (async () => {
//   await Subscription.sync({ force: true });
//   console.log('Subscription table synced');
// })();
// Sync DB and start server
sequelize.sync({ alter: true })
  .then(() => {
    // console.log('Database synced');
    server.listen(PORT, () => {
      console.log('Server running on http://localhost:' + PORT);
    });
  })
  .catch((err) => console.error('DB error:', err));
