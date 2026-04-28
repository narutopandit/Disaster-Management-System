const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { authRole } = require("../middlewares/roleMiddleWare");
const { createIncidents, getAllIncidents, getMyIncidents, assignIncident, incidentStatusUpdate, findNearByResponders, getPendingAutoIncidents, reviewsIncidents, deleteIncident } = require("../controllers/incidentController");

const router = express.Router();

router.post("/create-incident",protect,authRole("citizen","admin","system"),createIncidents);
router.get("/get-all-incidents",protect,authRole("admin","responder","citizen"),getAllIncidents);
router.get("/my-incidents",protect,authRole("citizen"),getMyIncidents);
router.put('/assign',protect,authRole("admin"),assignIncident);
router.put('/incident-status',protect,authRole("responder"),incidentStatusUpdate);
router.get('/nearby-responders',protect,authRole('admin'),findNearByResponders);
router.get('/pending-incidents',protect,authRole("admin"),getPendingAutoIncidents);
router.put('/review',protect,authRole("admin"),reviewsIncidents);
router.delete('/delete-incident',protect,deleteIncident);
module.exports = router;