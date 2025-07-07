import Cart from "../models/cart.js";
import Order from "../models/orders.js";
import RetailerInvitation from "../models/retailerInvitationModel.js";
import User from "../models/userModel.js";
import wholesalerRetailerMap from "../models/wholesalerRetailerMap.js";
import { notifyWholesaler } from "../socket/socketController.js";

const getWholesalers = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const invitationsMap = await RetailerInvitation.findOne({
      where: { user_id: String(userId) },
    });
    const invitations = invitationsMap.invitations;
    // console.log(invitations);

    const wholesalers = await Promise.all(
      invitations.map(async (wholesalerId) => {
        const wholesaler = await User.findOne(
          { where: { user_id: Number(wholesalerId) } },
          {
            attributes: {
              include: ["user_id", "name", "email", "phone", "address"],
            },
          }
        );
        return wholesaler;
      })
    );
    // console.log(who
    // 
    // lesalers);
    return res.json(wholesalers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProducts = async (req, res) => {
  console.log("Got request to get products");
};
const placeOrder = async (req, res) => {
  try {
    console.log("Got request to place order");
    const { cart, address } = req.body;
    const { userId } = req.user;
    await cart.forEach(async (item) => {
      const order = await Order.create({
        user_id: userId,
        order_items: item,
        wholesaler_id: item.wholesaler_id,
        status: "pending",
        address: address,
      })
      const wholesaler = item.wholesaler_id;
      notifyWholesaler("new-order",wholesaler,order)
    })

    // Find the retailer's cart
    const retailerCart = await Cart.findOne({ where: { user_id: String(userId) } });

    if (retailerCart) {
      console.log("Emptying cart");
      retailerCart.cart_items = []; // Set to empty array
      // console.log(retailerCart.cart_items);
      retailerCart.changed("cart_items", true);
      await retailerCart.save();    // Save changes
    }

    return res.json({ message: "Order placed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addToCart = async (req, res) => {
  console.log("Adding to cart");
  console.log(req.body);
  const {name,price,quantity,product_id,wholesaler_id,addedAt} = req.body;
  const {userId} = req.user;
  if(!userId) return res.status(401).json({ message: "Unauthorized" });
 
  let cart = await Cart.findOne({where:{user_id:String(userId)}});
  if(!cart){
    console.log("Cart not found...creating cart");
    cart = await Cart.create({user_id:userId,cart_items:[]});
  }
  cart.cart_items.push({
    name,
    price,
    quantity,
    product_id,
    wholesaler_id,
    addedAt
  });
  cart.changed("cart_items",true);
  await cart.save();
  return res.json({message:"Item added to cart"});
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const result = await Cart.findOne({ where: { user_id: String(userId) } });
    if(!result){
      const cart = await Cart.create({user_id:userId,cart_items:[]});
      return cart.cart_items;
    }
    return res.json(result.cart_items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getOrders = async (req, res) => {
  try {
    const { userId } = req.user;
    const orders = await Order.findAll({ where: { user_id: String(userId) } });
    
    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteFromCart = async (req, res) => {
  const {id} = req.params;
  const {userId} = req.user;
  if(!userId) return res.status(401).json({ message: "Unauthorized" });
  let cart = await Cart.findOne({where:{user_id:String(userId)}});
  if(!cart) return res.status(404).json({ message: "Cart not found" });
  cart.cart_items = cart.cart_items.filter(item => String(item.product_id) !== String(id));
  cart.changed("cart_items",true);
  await cart.save();
  // console.log(cart.cart_items);
  return res.json({message:"Item deleted from cart"});
};


const subscribeWholesaler = async (req, res) => {
  const { inviteCode } = req.body;
  const { userId, email } = req.user;

  try {
    // Find wholesaler map by group_code
    const retailer = await User.findOne({ where: { user_id: userId } });
    const wholesalerMap = await wholesalerRetailerMap.findOne({
      where: { group_code: inviteCode },
    });
    if (!wholesalerMap) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    // Ensure retailers is an array
    if (!Array.isArray(wholesalerMap.retailers)) {
      wholesalerMap.retailers = [];
    }

    // Prevent duplicate retailer
    if (!wholesalerMap.retailers.includes(String(userId))) {
      wholesalerMap.retailers.push({ user_id: String(userId),total_orders:0,total_amount:0 ,amount_paid:0,invoices_pending:0});
      wholesalerMap.changed("retailers", true);
      await wholesalerMap.save();
    }

    // Find or create RetailerInvitation
    let retailerInvitations = await RetailerInvitation.findOne({
      where: { user_id: String(userId) },
    });
    if (!retailerInvitations) {
      retailerInvitations = await RetailerInvitation.create({
        user_id: String(userId),
        invitations: [String(wholesalerMap.wholesaler_id)],
      });
    } else {
      // Ensure invitations is an array
      if (!Array.isArray(retailerInvitations.invitations)) {
        retailerInvitations.invitations = [];
      }
      // Prevent duplicate invitation
      if (
        !retailerInvitations.invitations.includes(
          String(wholesalerMap.wholesaler_id)
        )
      ) {
        const updatedInvitations = [
          ...retailerInvitations.invitations,
          String(wholesalerMap.wholesaler_id),
        ];
        retailerInvitations.invitations = updatedInvitations;
        await retailerInvitations.save();
      }
    }
    await notifyWholesaler("new-retailer",wholesalerMap.wholesaler_id,{user_id:retailer.user_id,name:retailer.name,email:retailer.email,phone:retailer.phone});

    console.log("Retailer subscribed successfully");
    return res.json({ message: "Wholesaler subscribed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const editRetailer = async(req,res)=>{
  try {
    console.log("Got request to edit retailer", req.body);
    const { userId } = req.user;
    const id = userId;
    if (!id) return res.status(401).json({ message: "User id not found" });
    const user = await User.findOne({ where: { user_id: Number(id) } });
    if (!user) return res.status(404).json({ message: "User not found" });
    for (const [key, value] of Object.entries(req.body)) {
      if (value) user[key] = value;
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
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const cancelOrder = async(req,res)=>{
  const orderId = req.params.id;
  const order = await Order.findOne({where:{order_id:Number(orderId)}});
  if(!order) return res.status(404).json({message:"Order not found"});
  order.status = "cancelled";
  await order.save();
  notifyWholesaler("order-cancelled",order.wholesaler_id,order);
  return res.json({order,message:"Order cancelled"});
}
export default {
  getWholesalers,
  getProducts,
  placeOrder,
  addToCart,
  getOrders,
  subscribeWholesaler,
  getCart,
  deleteFromCart,
  editRetailer,
  cancelOrder
};
