require("dotenv").config()

const express = require("express")
const WebSocket = require("ws")
const fs = require("fs")

const app = express()

app.use(express.json())
app.use(express.static("overlay"))

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, "0.0.0.0", () => {
 console.log("Server running on", PORT)
})

const wss = new WebSocket.Server({
 server,
 path: "/ws"
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
  if(client.readyState === 1){
   client.send(JSON.stringify(payload))
  }
 })

}

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

 const wsProtocol = req.headers.host.includes("localhost") ? "ws" : "wss"

 res.json({
  ws:`${wsProtocol}://${req.headers.host}/ws`
 })

})

wss.on("connection",(ws)=>{

 const payload = {
  date:new Date().toLocaleDateString("th-TH"),
  win:data.win,
  lose:data.lose
 }

 ws.send(JSON.stringify(payload))

})