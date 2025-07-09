import Cart from "../models/cart.js";
import Order from "../models/orders.js";
import Payment from "../models/payment.js";
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
    return res.json(wholesalers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProducts = async (req, res) => {
  try {
    console.log("Got request to get products");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const placeOrder = async (req, res) => {
  try {
    console.log("Got request to place order");
    const { cart, address } = req.body;
    const { userId } = req.user;
    await Promise.all(
      cart.map(async (item) => {
        const order = await Order.create({
          user_id: userId,
          order_items: item,
          wholesaler_id: item.wholesaler_id,
          status: "pending",
          address: address,
        });
        const wholesaler = item.wholesaler_id;
        notifyWholesaler("new-order", wholesaler, order);

        const map = await wholesalerRetailerMap.findOne({
          where: { wholesaler_id: wholesaler },
        });
        const retailerIndex = map.retailers.findIndex(
          (retailer) => JSON.parse(retailer).user_id === String(userId)
        );
        if (retailerIndex !== -1) {
          const retailerData = JSON.parse(map.retailers[retailerIndex]);
          retailerData.total_orders += 1;
          retailerData.total_amount += Number(item.price) * Number(item.quantity);
          map.retailers[retailerIndex] = JSON.stringify(retailerData);
          map.changed("retailers", true);
          await map.save();
        }
      })
    );

    const retailerCart = await Cart.findOne({
      where: { user_id: String(userId) },
    });

    if (retailerCart) {
      retailerCart.cart_items = [];
      retailerCart.changed("cart_items", true);
      await retailerCart.save();
    }
    return res.json({ message: "Order placed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addToCart = async (req, res) => {
  try {
    console.log(req.body);
    const { name, price, quantity, product_id, wholesaler_id, addedAt } =
      req.body;
    const { userId } = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let cart = await Cart.findOne({ where: { user_id: String(userId) } });
    if (!cart) {
      cart = await Cart.create({ user_id: userId, cart_items: [] });
    }
    cart.cart_items.push({
      name,
      price,
      quantity,
      product_id,
      wholesaler_id,
      addedAt,
    });
    cart.changed("cart_items", true);
    await cart.save();
    return res.json({ message: "Item added to cart" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const result = await Cart.findOne({ where: { user_id: String(userId) } });
    if (!result) {
      const cart = await Cart.create({ user_id: userId, cart_items: [] });
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
  try {
    const { id } = req.params;
    const { userId } = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    let cart = await Cart.findOne({ where: { user_id: String(userId) } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.cart_items = cart.cart_items.filter(
      (item) => String(item.product_id) !== String(id)
    );
    cart.changed("cart_items", true);
    await cart.save();
    return res.json({ message: "Item deleted from cart" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const subscribeWholesaler = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    console.log(inviteCode)
    const { userId, email } = req.user;

    const retailer = await User.findOne({ where: { user_id: userId } });
    const wholesalerMap = await wholesalerRetailerMap.findOne({
      where: { group_code: inviteCode },
    });
    if (!wholesalerMap) {
      console.log("Invalid invite code");
      return res.status(404).json({ message: "Invalid invite code" });
      
    }

    if (!Array.isArray(wholesalerMap.retailers)) {
      wholesalerMap.retailers = [];
    }

    if (!wholesalerMap.retailers.includes(String(userId))) {
      wholesalerMap.retailers.push({
        user_id: String(userId),
        total_orders: 0,
        total_amount: 0,
        amount_paid: 0,
        invoices_pending: 0,
      });
      wholesalerMap.changed("retailers", true);
      await wholesalerMap.save();
    }

    let retailerInvitations = await RetailerInvitation.findOne({
      where: { user_id: String(userId) },
    });
    if (!retailerInvitations) {
      retailerInvitations = await RetailerInvitation.create({
        user_id: String(userId),
        invitations: [String(wholesalerMap.wholesaler_id)],
      });
    } else {
      if (!Array.isArray(retailerInvitations.invitations)) {
        retailerInvitations.invitations = [];
      }
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
    await notifyWholesaler("new-retailer", wholesalerMap.wholesaler_id, {
      user_id: retailer.user_id,
      name: retailer.name,
      email: retailer.email,
      phone: retailer.phone,
    });

    return res.json({ message: "Wholesaler subscribed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const editRetailer = async (req, res) => {
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

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ where: { order_id: Number(orderId) } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "cancelled";
    await order.save();
    const map = await wholesalerRetailerMap.findOne({
      where: { wholesaler_id: Number(order.wholesaler_id) },
    });
    console.log(map);
    const retailerData = map.retailers.find(
      (retailer) => String(retailer.user_id) === String(order.user_id)
    );
    retailerData.total_orders -= 1;
    retailerData.total_amount -= Number(order.amount_paid);
    notifyWholesaler("order-cancelled", order.wholesaler_id, order);
    return res.json({ order, message: "Order cancelled" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPayments = async(req,res)=>{
  const {userId} = req.user;
  try {
    const payments = await Payment.findAll({where:{user_id:String(userId)}});
    return res.json(payments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
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
  cancelOrder,
  getPayments
};

