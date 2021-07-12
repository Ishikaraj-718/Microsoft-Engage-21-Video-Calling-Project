const express = require('express')
const app = express()

const http=require("http");

const mongoose =require("mongoose");
const bodyParser = require("body-parser");
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

const { v4: uuidV4 } = require('uuid') 
const generateUniqueId = require('generate-unique-id');
 
const id = generateUniqueId();
var fs=require('file-system');
var ejs=require('ejs');
app.use('/peerjs', peerServer);    

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
const chat_name= id+'chat';

 console.log(chat_name);

   const dbName=chat_name;
   const dbpath = 'mongodb+srv://Ishika_raj:Ishika123@cluster0.17rjv.mongodb.net/'+dbName;      //Database to store messages
  
   
  
const messageSchema = new mongoose.Schema({
  name: String,
  text: String,
  time: String
});



const messageCollections = mongoose.model("messageCollections",messageSchema);

const Defmsg = new messageCollections({
  name:"All messages",
  text:"",
  time:""
});

Defmsg.save()

 let name1;

app.get('/', (req, res) => {
  var filepath= __dirname + '/views/index.ejs';
  var template = fs.readFileSync(filepath, 'utf8');
  res.end(ejs.render(template,{roomId: uuidV4(),roomId1:id}));  
    
})
app.post('/',(req,res)=>{
  
  
  res.redirect(`/${uuidV4()}`)  
})
app.get('/'+id,(req,res)=>{

  res.render('ChatRoom', { roomId1:id})
})


app.get('/:room/leave',(req,res)=>{
  res.sendFile(__dirname+"/LeaveMeet.html");
})
app.get('/:room', (req, res) => {
  
  res.render('room', { roomId: req.params.room,roomId1:id})
});

app.post('/:room/leave',(req,res)=>{
  res.redirect('/') 
})

app.get('/:dbName/chat',(req,res)=>{                         //Api path where message are stored
  
  messageCollections.find(function(err,foundmessages){         
       
       res.send(foundmessages);
  })
})


app.post('/:dbName/chat',(req,res)=>{                   //Saves messages which is send from Outside Room 
  var currentdate = new Date(); 
 var datetime =  currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();

  const Outmsg = new messageCollections({ 
    name:req.body.Name,
    text:req.body.TeamMsg,
    time: datetime
  });

  Outmsg.save()
    
  res.redirect('/'+id)
})



try {
  mongoose.connect( dbpath, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
  console.log("you are connected to the database"));   
  
  io.on('connection', socket => {
    socket.on('join-room', (roomId, userId ,username) => {
      socket.join(roomId)
      console.log(username);

      
      
      socket.to(roomId).emit('user-connected', userId ,username);
      // messages
      
      socket.on('user-joined',(username)=>{
        io.to(roomId).emit('Add_participant',username)
      }) 
      console.log("connected")
      
      
  
      socket.on('message', (message) => {

        var currentdate = new Date(); 
       var datetime =  currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
          
        const msg = new messageCollections({         //Saves messages which send from inside room
          name: username,
          text: message,
          time: datetime
        });

        msg.save();
        //send message to the same room
        

        io.to(roomId).emit('createMessage', message,username)
    }); 
  
    
  
      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId,username)
      })
    })
  })

  
  }catch (error) { 
  console.log("could not connect");    
  }


server.listen(process.env.PORT||3000,()=>{
  console.log("server listening on port 3000")
})
