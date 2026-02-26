const Users = require("../models/Users");
const { generateToken, generateRefreshToken } = require("../utils/generateToken");



exports.register = async(req,res)=>{
   try {
    const {name,email,password,role,phone,longitude,latitude} = req.body;

    const userExists = await Users.findOne({email});
    if(userExists){
        return res.status(400).json({message:"User Already Exists!"});
    }
    const user = await Users.create({
        name,email,password,role,phone,
        location:{
            type:"Point",
            coordinates:[longitude,latitude]
        }
    });
    return res.status(201).json({message:"User Registered!"});
   } catch (error) {
    return res.status(500).json({message:error.message});
   }
}

exports.login = async(req,res)=>{
    try {
        const{email,password} = req.body;

    const user = await Users.findOne({email});
    if(!user || !(await user.matchPassword(password))){
        return res.status(401).json({message:"Invalid credentials!"});
    }
    res.json({
        token:generateToken(user),
        refreshToken:generateRefreshToken(user),
        user
});
    } catch (error) {
        return res.status(500).json({message:error.message});
    }
}