const express = require('express')
const mongoose = require('mongoose')
const chalk = require('chalk')

const router = express.Router();

const shortURLCollection = require('../models/shorturls')

router.get('/:shortURL',async (req,res)=>{
    const shortURL = await shortURLCollection.findOne({shortURL:req.params.shortURL})
    if(shortURL===null){
        const customURL = await shortURLCollection.findOne({customShortURL:req.params.shortURL})
        if(customURL===null){
            res.send('<h1>Uh Oh This link does not exist</h1>')
        }
        else{
            redirectShort(customURL,res)
        }
    }
    else{
        redirectShort(shortURL,res)
    }
})

function redirectShort(shortURL,res) {
    shortURL.visits++;
    shortURL.save();
    res.redirect(shortURL.fullURL)
}
module.exports = router;