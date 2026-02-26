const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required: true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        role:{
            type:String,
            enum:["citizen","responder","admin","system"],
            default:"citizen"
        },
        location:{
            type:{
                type:String,
                enum:["Point"]
            },
            coordinates:{
                type:[Number]
            }
        },
        phone:String
    },
    {timestamps:true}
);

userSchema.index({location:"2dsphere"});

userSchema.pre("save",async function(){
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password,10);
});

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

module.exports = mongoose.model("User",userSchema);