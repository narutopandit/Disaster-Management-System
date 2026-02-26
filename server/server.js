require("dotenv").config();

const http = require("http");
const connectDb = require("./config/db.js");
const app = require("./app.js");
const {Server} = require("socket.io");
const cron = require("node-cron");
const fetchNewsAndCreateIncidents = require("./utils/newsFetcher.js");

const startServer = async () => {
    await connectDb();
    
    const server = http.createServer(app);
    const PORT = process.env.PORT || 5000;

    const io = new Server(server,{
        cors:{
            origin:"*",
        }
    });



    io.on("connection",(socket)=>{
        console.log(`user connected ${socket.id}`);

        socket.on("joinRoom",({userId,role})=>{
            socket.join(role);
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined ${role}`);
        })

        socket.on("disconnect",()=>{
            console.log("User disconnected");
        })
    })
    
     app.set("io",io);
    server.listen(PORT, () => {
        console.log("server is running on port: ", PORT);
    });

    cron.schedule("*/30 * * * *", () => {
        console.log("Fetching disaster news...");
        fetchNewsAndCreateIncidents(io);
        });
    
    server.on('error', (err) => {
        console.error('Server error:', err);
    });
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});


