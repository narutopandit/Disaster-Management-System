const md = require("mongoose");

const connectDb = async()=>{
    try{
        const con = await md.connect(process.env.MONGO_URI);
        console.log("Database Connected!");
    }catch(error){
        console.log("Database Connection Failed!",error.message);
        process.exit(1);
    };
}

module.exports = connectDb;