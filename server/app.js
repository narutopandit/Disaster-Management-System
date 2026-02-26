const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgon = require("morgan");
const authRoutes = require("./Routes/authRoutes");
const incidentRoutes = require("./Routes/incidentRoutes");
const alertRoutes = require("./Routes/alertRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgon("dev"));


app.use("/api/auth",authRoutes);
app.use('/api',incidentRoutes);
app.use('/api/alerts',alertRoutes)

module.exports = app;