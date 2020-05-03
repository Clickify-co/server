// SENTRY
const sentry = require('@sentry/node')
const express = require('express')
const chalk = require('chalk')
const mongoose = require('mongoose')
let app = express();

require('dotenv').config()  //Environment Configs

// CONFIGURE SENTRY
sentry.init({ dsn: 'https://ff6da09a7063490b9110bbabb62f9c10@o386985.ingest.sentry.io/5221811' });
//SPECIAL ERROR CHECK
undefinedfunction();

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
