require("dotenv").config()

const express = require("express")
const WebSocket = require("ws")
const fs = require("fs")

const app = express()

app.use(express.json())
app.use(express.static("overlay"))

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
 console.log("Server running on", PORT)
})

const wss = new WebSocket.Server({
 server,
 path:"/ws"
})

let data = { win:0, lose:0 }

if(fs.existsSync("./data.json")){
 data = JSON.parse(fs.readFileSync("./data.json"))
}

function save(){
 fs.writeFileSync("./data.json",JSON.stringify(data))
}

function broadcast(){

 const payload = {
  date:new Date().toLocaleDateString("th-TH"),
  win:data.win,
  lose:data.lose
 }

 wss.clients.forEach(client=>{
  if(client.readyState === WebSocket.OPEN){
   client.send(JSON.stringify(payload))
  }
 })

}

wss.on("connection",(ws)=>{

 console.log("overlay connected")

 ws.send(JSON.stringify({
  date:new Date().toLocaleDateString("th-TH"),
  win:data.win,
  lose:data.lose
 }))

 ws.on("pong",()=>{
  ws.isAlive=true
 })

 ws.isAlive=true

})

setInterval(()=>{

 wss.clients.forEach(ws=>{

  if(!ws.isAlive) return ws.terminate()

  ws.isAlive=false
  ws.ping()

 })

},30000)

app.get("/score",(req,res)=>{
 res.json(data)
})

app.post("/win",(req,res)=>{
 data.win++
 save()
 broadcast()
 res.send("ok")
})

app.post("/win-minus",(req,res)=>{
 data.win=Math.max(0,data.win-1)
 save()
 broadcast()
 res.send("ok")
})

app.post("/lose",(req,res)=>{
 data.lose++
 save()
 broadcast()
 res.send("ok")
})

app.post("/lose-minus",(req,res)=>{
 data.lose=Math.max(0,data.lose-1)
 save()
 broadcast()
 res.send("ok")
})

app.post("/reset",(req,res)=>{
 data.win=0
 data.lose=0
 save()
 broadcast()
 res.send("ok")
})

app.get("/config",(req,res)=>{

 const protocol=req.headers.host.includes("localhost")?"ws":"wss"

 res.json({
  ws:`${protocol}://${req.headers.host}/ws`
 })

})