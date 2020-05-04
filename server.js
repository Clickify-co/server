// SENTRY
const sentry = require('@sentry/node')
const express = require('express')
const chalk = require('chalk')
const mongoose = require('mongoose')
let app = express();

require('dotenv').config()  //Environment Configs

// CONFIGURE SENTRY
sentry.init({ dsn: 'https://1c683ce30a9a49699f2061a314493f1d@o386985.ingest.sentry.io/5221824' });

// mongoDBConnection
mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true},(err)=>{
    if (err)
        console.log(chalk.red('MongoDb Connection Error'));
    else    
        console.log(chalk.green('Connected to MongoDB'));
})
// mongoDBConnection

// SERVER SETTINGS
    app.use(express.urlencoded({extended:false}))
    app.use((req,res,send)=>{
        res.status(404).send('uh oh, This Link was not created.')
    })
// SERVER SETTINGS

// MAKE SERVER TO LISTEN
app.listen(process.env.PORT || 3000,()=>{
    console.log('Server is Listening at',chalk.red(process.env.PORT || 3000))
})
// MAKE SERVER TO LISTEN

// ROUTES
    // Routes Import
    let userRoutes = require('./routes/userRoutes')
    app.use('/user/',userRoutes)
    let shortRoutes = require('./routes/shortRoutes')
    app.use('/',shortRoutes)
app.post('/',(req,res)=>{
    res.send(req.body)
})
// ROUTES
