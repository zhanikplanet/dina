const express = require('express')
const http =require('http')
const cors = require('cors')
const sampleRoutes = require('./route/sample')
const {connectMongodb}= require('./mongodb')


const app=express();
const server=http.createServer(app)
app.use(cors())
app.use(express.json())
app.use(express.static(__dirname));
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');
})
app.use('/api',sampleRoutes)

const PORT =process.env.PORT || 3000

connectMongodb()
    .then(() =>{
        server.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
    })
    .catch((error)=>{
        console.error("Failed to connect to the Mongodb",error)
        process.exit(1)
    })
    