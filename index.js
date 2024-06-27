


const express=require('express')
const cors= require('cors')
const port =process.env.PORT || 5000;
require ('dotenv').config()
const app=express()

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://WareWolf:${process.env.DB_PASS}@cluster0.ravtcpm.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db=client.db("Warewolf");
    const playerCollection=db.collection("playerCollection");

    var changeStreams =  db.collection('lalalal').watch()
    changeStreams.on('change', function(change){
      console.log(change)  
    })
    app.post("/players",async (req,res)=>{

      const body=req.body;
      const result = await playerCollection.insertOne(body)
      res.send()

      console.log(result)

    })

    //creating a new collection for lobby based on the name of the player
    app.post('/lobby/:user',async(req,res)=>{

    const lobbyCollection=db.collection(req.params.user)   
    const body=await playerCollection.find({playerName:req.params.user}).toArray()


    const result=await lobbyCollection.insertOne(body[0])
    


    const updatedDoc={
      $set:{
        playerNum:1
        

      }

    }
    const addNum=await lobbyCollection.updateOne({playerName:req.params.user},updatedDoc);
     res.send(result)


    })
    
    //get lobby palyer datas for the game

    app.get('/lobby/:room',async(req,res)=>{

      const lobbyCollection=db.collection(req.params.room)   
   
      const result=await lobbyCollection.find({}).toArray()
  
      res.send(result)

  
      })

    app.get('/players/:user',async(req,res)=>{
      const result=await playerCollection.find({}).toArray()
      res.send(result);

    })


    //manging the lobby system (getting all players in the same lobby)
     
    app.put('/lobbyJoin/:user',async(req,res)=>{

           
      const body=req.body

      //getting list of all the collections to see if the lobby exists
      const dbName=db.listCollections().toArray(function(err) {
        if(err) console.log(err)});
        const user=req.params.user
        //if the lobby exists insert the player in the lobby collection
      if((await dbName).find(Lobby=>Lobby.name==body.lobbyNum)){
       

        //setting a number for player based on the number of players in the lobb

    
        const filter={playerName: user}
        const lobby=db.collection(body.lobbyNum)
        const lobbyPLayers=await lobby.find({}).toArray()
        const existPlayers= await lobby.find(filter).toArray()
        const newPlayer=await playerCollection.find(filter).toArray()
        if(!existPlayers.find(player=>player.playerName==user)){
        const enterPlayer= await lobby.insertOne(newPlayer[0])
        }
        else{
          console.log("player already exists")
        }

        if(lobbyPLayers.length>=1){
          const updatedDoc={
            $set:{
              playerNum:lobbyPLayers.length+1
              
    
            }
          }
        const result=await lobby.updateOne(filter,updatedDoc);
 
        }

        console.log(lobbyPLayers)
        console.log(newPlayer[0])

      }
   else{
    console.log("no lobby found")
    const body={error:"no lobby found"}
    const filter={playerName: user}
    const updatedDoc={
      $set:{
        Error:body
        

      }
    }
    const result=await playerCollection.updateOne(filter,updatedDoc);
    res.send(result)
   }
    
    })


    //handle messaging

    app.post("/chat/:room",async (req,res)=>{

      const room=req.params.room
      const body=req.body;
      const lobby=db.collection(room)
      lobby.updateOne(
        {playerName:room},
        {
          $push: {
                   "Chats": {
                               body
                              }
                  }
         }
)
      res.send()

    })



  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);







app.get('/',(req,res)=>{
    res.send("simple crud is running")
})


app.listen(port,()=>{
    console.log('server is running on port 5000')
})