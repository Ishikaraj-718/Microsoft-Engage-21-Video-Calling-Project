const express = require('express')
const app = express()  

const http=require("http");
const cookieParser=require('cookie-parser');
const mongoose =require("mongoose");
const bodyParser = require("body-parser");
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID="854582330305-6roueat79vs5unb14908pd96h6pf5umb.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
const { v4: uuidV4 } = require('uuid') 
const generateUniqueId = require('generate-unique-id');
 
const id = generateUniqueId();
var fs=require('file-system');
var ejs=require('ejs');
app.use('/peerjs', peerServer);    

app.set('view engine', 'ejs');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
const chat_name= id+'chat';

 console.log(chat_name);

   const dbName=chat_name;
   const dbpath = 'mongodb+srv://Ishika_raj:Ishika123@cluster0.17rjv.mongodb.net/'+dbName;      //Database to store messages
  
   
  
const messageSchema = new mongoose.Schema({
  name: String,
  text: String
});



const messageCollections = mongoose.model("messageCollections",messageSchema);

const Defmsg = new messageCollections({
  name:"All messages",
  text:""
});

Defmsg.save()

 let name1;

app.get('/', (req, res) => {
  var filepath= __dirname + '/views/index.ejs';
  var template = fs.readFileSync(filepath, 'utf8');
  res.end(ejs.render(template,{roomId: uuidV4(),roomId1:id}));  
    
})
app.post('/',(req,res)=>{
  let token=req.body.token;
  console.log(req.body.token);
  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    name1=payload.given_name;
    console.log(payload)
  }
  verify().catch(console.error);
  
  res.redirect(`/${uuidV4()}`)  
})
app.get('/'+id,(req,res)=>{

  res.render('CreateTeam', { roomId1:id})
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
  

  const Outmsg = new messageCollections({ 
    name:name1,
    text:req.body.TeamMsg
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
          
        const msg = new messageCollections({         //Saves messages which send from inside room
          name: username,
          text: message
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
