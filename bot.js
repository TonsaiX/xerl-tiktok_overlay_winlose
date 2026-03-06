require("dotenv").config()

const {
 Client,
 GatewayIntentBits,
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle,
 EmbedBuilder
} = require("discord.js")

const axios = require("axios")

const client = new Client({
 intents:[GatewayIntentBits.Guilds]
})

const API = process.env.API_URL

client.once("ready", async ()=>{

 console.log("Discord bot ready")

 const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID)

 const embed = new EmbedBuilder()
 .setTitle(process.env.EMBED_TITLE || "🎮 Stream Score Control")
 .setDescription("กดปุ่มด้านล่างเพื่อเพิ่มหรือลดคะแนน")
 .setColor("#"+(process.env.EMBED_COLOR || "00ff9d"))
 .setThumbnail(process.env.EMBED_THUMBNAIL || null)
 .setImage(process.env.EMBED_BANNER || null)
 .setFooter({text:"Win / Lose Controller"})
 .setTimestamp()

 const row = new ActionRowBuilder()
 .addComponents(

 new ButtonBuilder()
 .setCustomId("win_add")
 .setLabel("WIN +1")
 .setStyle(ButtonStyle.Success),

 new ButtonBuilder()
 .setCustomId("win_minus")
 .setLabel("WIN -1")
 .setStyle(ButtonStyle.Secondary),

 new ButtonBuilder()
 .setCustomId("lose_add")
 .setLabel("LOSE +1")
 .setStyle(ButtonStyle.Danger),

 new ButtonBuilder()
 .setCustomId("lose_minus")
 .setLabel("LOSE -1")
 .setStyle(ButtonStyle.Secondary),

 new ButtonBuilder()
 .setCustomId("reset")
 .setLabel("RESET")
 .setStyle(ButtonStyle.Primary)

 )

 await channel.send({
  embeds:[embed],
  components:[row]
 })

})

client.on("interactionCreate", async interaction => {

 if(!interaction.isButton()) return

 try{

 if(interaction.customId==="win_add")
 await axios.post(API+"/win")

 if(interaction.customId==="win_minus")
 await axios.post(API+"/win-minus")

 if(interaction.customId==="lose_add")
 await axios.post(API+"/lose")

 if(interaction.customId==="lose_minus")
 await axios.post(API+"/lose-minus")

 if(interaction.customId==="reset")
 await axios.post(API+"/reset")

 await interaction.reply({
  content:"✅ Updated",
  ephemeral:true
 })

 }catch(err){

 await interaction.reply({
  content:"❌ API Error",
  ephemeral:true
 })

 }

})

client.login(process.env.DISCORD_TOKEN)