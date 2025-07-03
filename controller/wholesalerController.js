import Product from "../models/productModel.js";
const getProducts = async(req,res)=>{
    const userId = String(req.user.userId);
    if(!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        const products = await Product.findAll({where:{wholesaler_id:userId}});
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export default {getProducts}