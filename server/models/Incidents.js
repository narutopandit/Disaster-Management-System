const md = require("mongoose");

const incidentSchema = md.Schema({
    title:{
        type:String,
        required: true
    },
    description:{
        type:String,
        required:true
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        default:"low"
    },
        reviewStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    status:{
        type:String,
        enum:["verified","In-progress","pending","solved"],
        default:"pending"
    },
    reportedBy:{
        type:md.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    assignedTo:{
        type:md.Schema.Types.ObjectId,
        ref:"User",
        required:false
    },
    location:{
        type:{
            type:String,
            enum:["Point"],
            required:true,
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    source: {
        type: String,
    },

    newsUrl: {
        type: String,
    },



    autoDetected: {
        type: Boolean,
        default: false,
    },
    images:[String]
},{ timestamps:true}
)

incidentSchema.index({location:"2dsphere"});

module.exports = md.model("Incident",incidentSchema);