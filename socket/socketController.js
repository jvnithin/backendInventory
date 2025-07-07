import io from "../server.js";

// Use Maps for efficient lookup and overwrite
const wholesalerMap = new Map(); // userId -> socketId
const retailerMap = new Map();   // userId -> socketId

const socketController = (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('wholesaler-connect', (data) => {
    console.log("Wholesaler connected:", data);
    wholesalerMap.set(String(data.id), socket.id); // Always keep latest
  });

  socket.on('retailer-connect', (data) => {
    console.log("Retailer connected:", data);
    retailerMap.set(String(data.id), socket.id); // Always keep latest
  });

  socket.on('message', (data) => {
    console.log('Received message:', data);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove from wholesaler map if present
    for (let [userId, sockId] of wholesalerMap.entries()) {
      if (sockId === socket.id) {
        wholesalerMap.delete(userId);
        break;
      }
    }
    // Remove from retailer map if present
    for (let [userId, sockId] of retailerMap.entries()) {
      if (sockId === socket.id) {
        retailerMap.delete(userId);
        break;
      }
    }
  });
};

// Notify functions now use Map
export const notifyWholesaler = async(event, wholesalerId, data) => {
  try {
    const socketId = wholesalerMap.get(String(wholesalerId));
    if (socketId) {
      io.to(socketId).emit(event, data);
      console.log(`Emitted event '${event}' to wholesaler ${wholesalerId} on socket ${socketId}`);
    } else {
      console.log(`No active socket for wholesaler ${wholesalerId}`);
    }
  } catch (error) {
    console.error(error);
  }
};

export const notifyRetailer = async(event, retailerId, data) => {
  try {
    const socketId = retailerMap.get(String(retailerId));
    if (socketId) {
      io.to(socketId).emit(event, data);
      console.log(`Emitted event '${event}' to retailer ${retailerId} on socket ${socketId}`);
    } else {
      console.log(`No active socket for retailer ${retailerId}`);
    }
  } catch (error) {
    console.error(error);
  }
};

export default socketController;
