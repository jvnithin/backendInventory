import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import wholeSalerModel from "../models/wholeSalerModel.js";
import WholesalerRetailerMapModel from "../models/wholesalerRetailerMap.js";
import RetailerInvitation from "../models/retailerInvitationModel.js";
import Subscription from "../models/subscription.js";
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = await jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );
    if (user.role === "wholesaler") {
      const wholesaler = await wholeSalerModel.findOne({
        where: { user_id: String(user.user_id) },
      });
      if (!wholesaler) {
        return res.status(404).json({ error: "Wholesaler not found" });
      }
      if (wholesaler.isdeactivated) {
        return res.status(401).json({ message: "Wholesaler is deactivated" });
      }
      const subscription = await Subscription.findOne({
        where: { user_id: String(user.user_id) },
      });
      if (!subscription) {
        console.log("subscription not found")
        return res.status(404).json({ error: "Subscription not found" });
      }
      let subscriptionExpired = false;
      if(!subscription) subscriptionExpired = true;
      if(subscription && subscription.end_date < new Date()) subscriptionExpired = true;
      if (subscription && subscription.end_date < new Date()) {
        subscriptionExpired = true;
      }
      return res.json({
        message: "Login successful",
        token,
        user: {
          subscription_expiry: subscription?.end_date,
          subscriptionExpired,
          name: user.name,
          userId: user.user_id,
          email: user.email,
          role: user.role,
          group_code: wholesaler.group_code,
        },
      });
    }
    return res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        userId: user.user_id,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address={},
      role="retailer",
    } = req.body;
    // console.log(req.body);
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(401).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
    });
    if (role === "wholesaler") {
      const group_code = String(Math.floor(1000000 + Math.random() * 9000000));
      const wholesalerCode = await wholeSalerModel.create({
        user_id: user.user_id,
        group_code,
      });
      const wholesalerMapping = await WholesalerRetailerMapModel.create({
        group_code,
        wholesaler_id: user.user_id,
      });
      console.log("Creating 7 day subscription");
      const subscription = await Subscription.create({ user_id: String(user.user_id), start_date: new Date(), end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
      console.log(subscription);
    }
    if (role === "retailer") {
      const retailerInvitations = await RetailerInvitation.create({
        user_id: user.user_id,
      });
    }
    return res.json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }
    const decoded = jwt.decode(token);
    const user = await User.findByPk(decoded.userId);
    if (decoded.role === "wholesaler") {
      const wholesaler = await wholeSalerModel.findOne({
        where: { user_id: String(user.user_id) },
      });
      if (wholesaler.isdeactivated) {
        return res.status(401).json({ message: "Wholesaler is deactivated" });
      }
      const subscription = await Subscription.findOne({
        where: { user_id: String(decoded.userId) },
      })
      console.log(subscription);
      let subscriptionExpired = false;
      if(!subscription) subscriptionExpired = true;
      if(subscription?.end_date < new Date()) subscriptionExpired = true;
      return res.json({
        message: "Login successful",
        token,
        user: {
          subscription_expiry: subscription?.end_date,
          subscriptionExpired,
          name:user.name,
          userId: user.user_id,
          email: user.email,
          role: user.role,
          group_code: wholesaler.group_code,
          address:user.address
        },
      });
    }
    return res.json({
      user: {
        name: user.name,
        userId: user.user_id,
        email: user.email,
        role: user.role,
        address:user.address
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default { login, register, getUser };
