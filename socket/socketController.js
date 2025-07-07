import io from "../server.js";

const wholesalerMap = []; 
const retailerMap = [];
const socketController = (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('wholesaler-connect', (data) => {
    console.log("Wholesaler connected:", data);
    wholesalerMap.push({
      userId: data.id,
      socketId: socket.id
    });
  })
  socket.on('retailer-connect', (data) => {
    console.log("Retailer connected:", data);
    retailerMap.push({
      userId: data.id,
      socketId: socket.id
    });
  })
  // Example: Listen for a custom event
  socket.on('message', (data) => {
    console.log('Received message:', data);
    // Broadcast to all clients
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
}

export const notifyWholesaler = async(event,wholesalerId,data) => {
  console.log("Emitting event for wholesaler:", wholesalerId);
  console.log(wholesalerMap)
  const wholesalerSocket = wholesalerMap.find(wholesaler => String(wholesaler.userId) === String(wholesalerId));
  console.log(wholesalerSocket);
  if (wholesalerSocket) {
    console.log("Wholesaler found");
    io.to(wholesalerSocket.socketId).emit(event, data);
  }
}

export const notifyRetailer = async(event,retailerId,data) => {
  console.log("Emitting event for retailer:", retailerId);
  const retailerSocket = retailerMap.find(retailer => String(retailer.userId) === String(retailerId));
  if (retailerSocket) {
    console.log("Retailer found");
    io.to(retailerSocket.socketId).emit(event, retailerId, data);
  }
}

export default socketController;