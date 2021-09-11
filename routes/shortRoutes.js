const express = require('express')
const mongoose = require('mongoose')
const chalk = require('chalk')
const shortid = require('shortid')

const router = express.Router();

const shortURLCollection = require('../models/shorturls')

router.get('/:shortURL',async (req,res)=>{
    const shortURL = await shortURLCollection.findOne({shortURL:req.params.shortURL})
    if(shortURL===null){
        const customURL = await shortURLCollection.findOne({customShortURL:req.params.shortURL})
        if(customURL===null){
            res.render('404.ejs')
        }
        else{
            redirectShort(customURL,res)
        }
    }
    else{
        redirectShort(shortURL,res)
    }
})

router.post('/createShort',(req,res)=>{
    let urlData = req.body;
    urlData.shortURL = shortid.generate();
    new shortURLCollection(urlData).save((err,response)=>{
        req.flash('shortURL',response.shortURL)
        req.flash('fullURL',response.fullURL)
        res.redirect('/')
    })
	
})

function redirectShort(shortURL,res) {
    if(shortURL.ownerID==='Clickify'){
        res.redirect(shortURL.fullURL)
    }
    else{
        let i = 0;
        flag = false;
        currentDate = new Date();
        console.log(currentDate);

        for(i = 0;i<(shortURL.dated).length;i++){
            if(compareDates(currentDate,shortURL.dated[i].dateOfVisit)){
                flag = true;
                break;
            }
            else{
                flag=false;
                continue;
            }
        }

        if(flag){
            shortURL.dated[i].numberOfVisits++;
            shortURL.visits++;
            shortURL.save();
            res.redirect(shortURL.fullURL)
        }
        else{
            const newdated = {
                dateOfVisit : currentDate,
                numberOfVisits:1
            }
            shortURL.dated.push(newdated)
            shortURL.visits++;
            shortURL.save();
            res.redirect(shortURL.fullURL)
        }

    }
}

function compareDates(d1,d2) {
    if(d1.getFullYear() === d2.getFullYear() && d1.getMonth()===d2.getMonth() && d1.getDate()===d2.getDate()){
        return true;
    }
    else{
        return false;
    }
}
module.exports = router;