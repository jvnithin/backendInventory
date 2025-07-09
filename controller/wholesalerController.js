import Order from "../models/orders.js";
import Product from "../models/productModel.js";
import Subscription from "../models/subscription.js";
import User from "../models/userModel.js";
import Payment from "../models/payment.js";
import WholesalerRetailerMap from "../models/wholesalerRetailerMap.js";
import { notifyRetailer } from "../socket/socketController.js";
const getProducts = async(req,res)=>{
    const {id} = req.params;
    // console.log(req.user);
    let userId = id === "me" ? req.user.userId : id;
    // console.log(userId)
    userId = String(userId);
    if(!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        const products = await Product.findAll({where:{wholesaler_id:userId}});
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
const getRetailers = async (req, res) => {
  const userId = req.user?.userId;
  console.log("Wholesaler userId:", userId);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const map = await WholesalerRetailerMap.findOne({
      where: { wholesaler_id: Number(userId) },
    });

    if (!map) return res.status(404).json({ message: "Wholesaler map not found" });

    const retailersData = map.retailers.map((retailer) => JSON.parse(retailer));
    const validRetailers = retailersData.filter((retailer) => Number.isFinite(Number(retailer.user_id)));

    const retailers = await Promise.all(
      validRetailers.map(async (retailer) => {
        const retailerData = await User.findOne({
          where: { user_id: Number(retailer.user_id) },
          attributes: ["email", "name", "phone", "user_id", "address"],
        });
        return {
          ...retailerData.dataValues,
          ...retailer,
        };
      })
    );
    return res.json(retailers.filter(Boolean));
  } catch (error) {
    console.error("Error in getRetailers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const editRetailer = async (req, res) => {
    const { name, phone, address } = req.body;
    const { id } = req.params;
    if (!id) return res.status(401).json({ message: "User id not found" });
    try {
        const user = await User.findOne({ where: { user_id: Number(id) } });
        if (!user) return res.status(404).json({ message: "User not found" });
        user.name = name;
        user.phone = phone;
        user.address = {
            ...user.address,
            ...address
        };
        
        // user.location = location;
        await user.save();
        return res.json({
            message: "User updated successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                userId: user.user_id,
                address: user.address
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const getOrders = async(req,res)=>{
    const {userId} = req.user;
    try {
        const orders = await Order.findAll({where:{wholesaler_id:String(userId)}});
        const ordersWithRetailer = await Promise.all(
            orders.map(async(order)=>{
                const retailer = await User.findOne({where:{user_id:order.user_id},attributes:["email","name","phone","user_id","address"]});
                order.retailer = retailer;
                return order;   
            })
        );
        return res.json(ordersWithRetailer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
const updateOrderStatus = async(req,res)=>{
    const {userId} = req.user;
    const {status} = req.body;
    const orderId = req.params.id;
    try {
        const order = await Order.findOne({ where: { order_id: Number(orderId) } });
        if (!order) return res.status(404).json({ message: "Order not found" });

        const map = await WholesalerRetailerMap.findOne({ where: { wholesaler_id: order.wholesaler_id } });
        const retailerListRef = map.retailers;
        
        let retailerList = retailerListRef.map((retailer) => JSON.parse(retailer));
        let retailerIndex = retailerList.findIndex(retailer => String(retailer.user_id) === String(order.user_id));
        if (retailerIndex === -1) return res.status(404).json({ message: "Retailer not found" });

        retailerList[retailerIndex].total_orders += 1;
        order.status = status;
        await order.save();
        notifyRetailer("order-complete", order.user_id, order);

        // retailerList[retailerIndex].total_amount += Number(order.amount_paid);

        // map.retailers = retailerList.map(retailer => JSON.stringify(retailer));
        await map.save();
        
        return res.json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
const editWholesaler = async (req, res) => {
  try {
    const { userId } = req.user;
    const id = userId;
    // console.log(req.user);
    if (!id) return res.status(401).json({ message: "User id not found" });  
    const user = await User.findOne({ where: { user_id: Number(id) } });
    if (!user) return res.status(404).json({ message: "User not found" });
    for(const [key,value] of Object.entries(req.body)){
      if(value) user[key] = value;
    }
    await user.save();
    return res.json({
        message: "User updated successfully",
        user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            userId: user.user_id,
            address: user.address,
            group_code: user.group_code
        }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const paymentUpdate = async(req,res)=>{

  const {userId} = req.user;
  const {retailerId,amount,wholesaler_id} = req.body;
  console.log(retailerId,amount);
  try {
    const retailer = await User.findOne({where:{user_id:Number(retailerId)},attributes:["email","name","phone","user_id","address"]});
    const payment = await Payment.create({user_id:retailerId,amount:Number(amount),role:"retailer",status:"successful",wholesaler_id});
    const wholesalerMap = await WholesalerRetailerMap.findOne({where:{wholesaler_id:Number(userId)}});
    console.log(wholesalerMap.retailers);
    wholesalerMap.retailers = wholesalerMap.retailers.map((retailerStr)=>{
      const retailer = JSON.parse(retailerStr);
      if(String(retailer.user_id) === String(retailerId)){
        console.log("Updating amount");
        retailer.amount_paid += Number(amount);
      }
      return JSON.stringify(retailer);
    });
    console.log(wholesalerMap.retailers);
    wholesalerMap.changed("retailers",true);
    await wholesalerMap.save();
    return res.json(retailer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
const addSubscription = async (req, res) => {
  try {
    const { userId } = req.user;
    const subscription = await Subscription.findOne({ where: { user_id: String(userId) } });
    if (!subscription) {
      console.log("Creating subscription");
      const subscription = await Subscription.create({ user_id: String(userId),start_date: new Date(), end_date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) });

      return res.status(200).json({ message: "Subscription added successfully",subscription });
    }
    subscription.end_date = new Date(subscription.end_date.getTime() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();
    return res.json({message:"Subscription updated successfully",subscription});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const getPayments = async(req,res)=>{
  const {userId} = req.user;
  try {
    const payments = await Payment.findAll({where:{wholesaler_id:String(userId)}});
    return res.json(payments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export default {getProducts,getRetailers,editRetailer,getOrders,updateOrderStatus,editWholesaler,addSubscription,paymentUpdate,getPayments};