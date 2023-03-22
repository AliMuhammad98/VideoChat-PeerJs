const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
}

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));



app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});


app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(()=>{
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000)

    //for disconnect feature
    socket.on("disconnect", (reason)=>{
      socket.broadcast.emit("user-disconnected", userId); 
  })

  socket.on("callEnded",()=>{
    console.log("CallEnded Event is Running")
    io.to(roomId).emit("call-ended",userId)
  })

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});
server.listen(process.env.PORT || 3030);
