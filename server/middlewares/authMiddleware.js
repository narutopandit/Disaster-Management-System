const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

exports.protect = async (req,res,next)=>{
    let token;
    try {
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }
        if(!token){
            return res.status(401).json({message: "not authorize no token!"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await Users.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        return res.status(401).json({message:error.message});
    }
}

