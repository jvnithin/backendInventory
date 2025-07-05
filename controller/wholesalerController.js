import Order from "../models/orders.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

import WholesalerRetailerMap from "../models/wholesalerRetailerMap.js";
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
const getRetailers = async(req,res)=>{
    const userId = req.user.userId;
    if(!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        const map = await WholesalerRetailerMap.findOne({where:{wholesaler_id:userId}});
        const retailerIds = map.retailers;
        const retailers = await Promise.all(
            retailerIds.map(id => User.findOne({where:{user_id:Number(id)},attributes:["email","name","phone","user_id","address"]})));
        return res.json(retailers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const editRetailer = async (req, res) => {
    console.log("Got request to edit retailer");
    const { name, phone, address } = req.body;
    const { id } = req.params;
    if (!id) return res.status(401).json({ message: "User id not found" });
    try {
        const user = await User.findOne({ where: { user_id: Number(id) } });
        if (!user) return res.status(404).json({ message: "User not found" });
        user.name = name;
        user.phone = phone;
        user.address = address;
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
    const order = await Order.findOne({where:{order_id:Number(orderId)}});
    if(!order) return res.status(404).json({message:"Order not found"});
    order.status = status;
    await order.save();
    return res.json(order);
}
export default {getProducts,getRetailers,editRetailer,getOrders,updateOrderStatus}