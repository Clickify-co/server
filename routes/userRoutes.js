const express =require('express')
const shortid = require('shortid')
const chalk = require('chalk')

const router = express.Router();
const shorturlCollection = require('../models/shorturls')

caundefined();

router.post('/addURL', async (req,res)=>{
    let urlData = req.body;
    urlData.shortURL = shortid.generate();
    const shortURL = await shorturlCollection.findOne({customShortURL:urlData.customShortURL});
    if(shortURL===null){
        new shorturlCollection(urlData).save((err)=>{
            if(err)
                console.log(chalk.red('Error in Inserting Data'))
            else{
                console.log(chalk.green('Data Inserted'))
                res.send({done:true,message:"succesfully inserted data"})
            }
        })
    }
    else{
        res.send({done:false,message:'customURL already Exists',status:1901})
    }
    
})

module.exports = router;