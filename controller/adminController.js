import User from "../models/userModel.js";
import WholesalerRetailerMap from "../models/wholesalerRetailerMap.js";

const getWholesalers = async(req,res)=>{
    const wholesalers = await User.findAll({where:{role:"wholesaler"},attributes: { exclude: ['password'] }})
    return res.json(wholesalers);
}

const getRetailers = async(req,res)=>{
    const {id} = req.params;
    try{
        const mapping = await WholesalerRetailerMap.findOne({where:{wholesaler_id:id}});
        if(!mapping) return res.status(404).json({ message: "Wholesaler not found" });
        const retailerIds = mapping.retailers;
        const retailers = await User.findAll({
            where: {user_id:retailerIds},
            attributes: { exclude: ['password'] }
        });
        return res.json(retailers);
    }catch(error){
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const deactivateWholesaler = async(req,res)=>{
    const {id} = req.params;
    try {
        const wholesaler = await User.findOne({where:{user_id:id}});
        if(!wholesaler) return res.status(404).json({ message: "Wholesaler not found" });
        wholesaler.isdeactivated = true;
        await wholesaler.save();
        return res.json({ message: "Wholesaler deactivated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export default {getWholesalers,getRetailers,deactivateWholesaler}