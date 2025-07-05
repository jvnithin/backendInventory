import jwt from "jsonwebtoken"

const verifyToken = (roles) => {
  return (req, res, next) => {
    console.log("In the middleware");
    const token = req.headers.authorization?.split(" ")[1];
    // console.log(token);
    if (!token) {
      console.log(token)
      return res.status(401).json({ message: "Token not found" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles && !roles.includes(decoded.role)) {
        console.log("This role is not allowed");
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
};
export default verifyToken;