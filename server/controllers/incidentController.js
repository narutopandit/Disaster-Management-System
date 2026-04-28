const Incidents = require("../models/Incidents");
const Users = require("../models/Users");


exports.createIncidents = async(req,res)=>{
    
    try {
        const {title,description,severity,location} = req.body;
        const incident = await Incidents.create({
        title,
        description,
        severity,
        reportedBy:req.user._id,
        status: req.user.role === "admin" ? "verified" : "pending",
        location
       });

       const io = req.app.get("io");
       io.to("responder").emit("newIncident",incident);

       return res.status(201).json({message:"Incident reported!",incident});
    } catch (error) {
        return res.status(401).json({message:error.message});
    }
}

exports.getAllIncidents = async(req,res)=>{
    try {
        const incident = await Incidents.find()
        .populate("reportedBy","name email")
        .populate("assignedTo","name email");

        return res.json(incident);
    } catch (error) {
        return res.status(401).json({message:error.message});
    }
}

exports.getMyIncidents = async(req,res)=>{
    try {
        const incidents = await Incidents.find({reportedBy:req.user._id});
        return res.json(incidents);
    } catch (error) {
        return res.status(401).json({message:error.message});
    }
}

exports.assignIncident = async(req,res)=>{
    const {incidentId,responderId} = req.body;

    try {
        const incident = await Incidents.findById(incidentId);
        if(!incident){
            return res.status(401).json({message:"Incident not found"});
        }
        const responder = await Users.findById(responderId);
        if(!responder){
            return res.status(401).json({message:"User not found"});
        }
        incident.assignedTo = responderId;
        incident.status = "verified";
        await incident.save();

        const io = req.app.get("io");
        io.to(`user_${responderId}`).emit("incidentAssigned",incident);

        return res.status(200).json({message:"Incident Assigned Sucessfully",incident});
    } catch (error) {
        return res.status(500).json({message:error.message});
    }
}

exports.incidentStatusUpdate = async(req,res)=>{
    try {
        const {incidentId,status} = req.body;
        const incident = await Incidents.findById(incidentId);
        if(!incident){
            return res.status(401).json({message:"Incident is not found"});
        }

        const isAssigned = incident.assignedTo && incident.assignedTo.toString() === req.user._id.toString();
        // Allow responders (and admins) to update incident status even if not assigned
        if (req.user.role !== 'responder' && req.user.role !== 'admin' && !isAssigned) {
            return res.status(403).json({message:"Not Authorized"});
        }

        // Normalize status values (client may use lowercase 'in-progress')
        const normalizedStatus = status === 'in-progress' ? 'In-progress' : status;
        incident.status = normalizedStatus;
        await incident.save();

        const io = req.app.get("io");
        io.to(`user_${incident.reportedBy}`).emit("statusUpdated",incident);

        return res.status(200).json({message:"Status updated"});
    } catch (error) {
        return res.status(500).json({message:error.message});
    }
}

exports.findNearByResponders = async(req,res)=>{
    try {
        const { incidentId } = req.query;

        const incident = await Incidents.findById(incidentId);
        if (!incident) {
            return res.status(404).json({message:"Incident not found"});
        }

        const [longitude, latitude] = incident.location.coordinates;

        const responders = await Users.find({  
            role:"responder",
            location:{
                $near:{
                    $geometry:{
                        type:"Point",
                        coordinates:[longitude, latitude]
                    },
                    $maxDistance: 10000,
                },
            }
        });
        if(!responders || responders.length === 0){
            return res.status(200).json([]);
        }

        return res.status(200).json(responders);
    } catch (error) {
        return res.status(500).json({message:error.message});
    }
}

exports.getPendingAutoIncidents = async(req,res) =>{
    try {
        const pendingIncidents = await Incidents.find({
            reviewStatus:"pending",
            autoDetected:"true"
        }).populate("reportedBy","name");

        res.json(pendingIncidents);;
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

exports.reviewsIncidents = async(req,res)=>{
    try {
        const {incidentId,action} = req.body;
        const incident = await Incidents.findById(incidentId);
        if(!incident) return res.status(401).json({message: "Incident not found"});

        if(action == "approve"){
            incident.reviewStatus = "approved";
            incident.status = "verified";
            await incident.save();

            const io = req.app.get("io");
            io.to("responder").emit("newIncident",incident);

            return res.json({message:"Incident is Approved",incident});
        }

        if(action == "reject"){
            incident.reviewStatus = "rejected";
            await incident.save();

            return res.json({message:"Incident is Rejected"});
        }
    } catch (error) {
        return res.status(500).json({message:error.message});
    }
}

// Delete incident
exports.deleteIncident = async (req, res) => {
    try {
        const { incidentId } = req.body;
        
        if (!incidentId) {
            return res.status(400).json({ message: "Incident ID is required" });
        }

        const incident = await Incidents.findById(incidentId);
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        // Allow only incident creator, assigned responder, or admin to delete
        const isCreator = incident.reportedBy.toString() === req.user._id.toString();
        const isAssigned = incident.assignedTo && incident.assignedTo.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAssigned && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this incident" });
        }

        await Incidents.findByIdAndDelete(incidentId);

        // Broadcast deletion to all users via Socket.IO
        const io = req.app.get("io");
        io.emit("incidentDeleted", incidentId);

        res.status(200).json({ message: "Incident deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}