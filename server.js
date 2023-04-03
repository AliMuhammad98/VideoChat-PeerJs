const express = require("express");
const app = express();
const server = require("http").Server(app);
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
//const { ExpressPeerServer } = require("peer");
// const opinions = {
//   debug: true,
// }
const bodyParser = require('body-parser');

//app.use("/peerjs", ExpressPeerServer(server, opinions));

// const peerServer = ExpressPeerServer(server, {
//   debug: true,
//   path: '/peerjs',
//   port: 9000
// });
// app.use('/peerjs', peerServer);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: true,
}));

app.get('/index',(req,res)=>{
  res.render('index')
})

// app.post('/second', (req, res) => {
//   const username = req.body.username;
//   res.render('second', { username });
// });
 

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});


app.get("/index", (req, res) => {
  res.render("index");
});

app.post("/index", (req, res) => {
  const { username } = req.body;
  req.session.username = username;
  const id="1122"
  res.redirect(`/${id}?username=${encodeURIComponent(username)}`);
});

app.get("/:room", (req, res) => {
  const { username } = req.session;
  res.render("room", { roomId: req.params.room,username });
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
server.listen(process.env.PORT || 3000,()=>{
  console.log("Node Server is Running ")
});
