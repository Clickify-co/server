const express = require('express');
const shortid = require('shortid');
const chalk = require('chalk');
const passport = require('passport');
const bcrypt = require('bcrypt');
const dateformat = require('dateformat')
const authCheckers = require('../authCheckers')

const router = express.Router();

const date_format = 'dd-mm-yyyy'

const shorturlCollection = require('../models/shorturls');
const userCollection = require('../models/users');

router.post('/setCustomURL',authCheckers.checkAuthenticated,async(req,res)=>{
	const shortURL = await shorturlCollection.findById(req.body.urlID)
	if(shortURL===null){
		req.flash('error','We could not find the URL')
		res.redirect('/user/dashboard')
	}
	else{
		shortURL.customShortURL = req.body.customShortURL;
		shortURL.save().then(()=>{
			req.flash('success','Custom URL updated')
			res.redirect('/user/dashboard')
		})
	}
})
router.post('/addURL',authCheckers.checkAuthenticated, async (req, res) => {
	let urlData = req.body;
	if(req.user){
		urlData.ownerID = req.user._id
	}
	urlData.shortURL = shortid.generate();
	const shortURL = null;
	if(req.body.customShortURL)
		shortURL = await shorturlCollection.findOne({ customShortURL: urlData.customShortURL });
	if (shortURL === null) {
		new shorturlCollection(urlData).save((err) => {
			if (err) console.log(chalk.red(err));
			else {
				req.flash('success','Shortlink generated.')
				res.redirect('/user/dashboard')
			}
		});
	} else {
		res.send({ done: false, message: 'customURL already Exists', status: 1901 });
	}
});
router.post('/register',authCheckers.checkUnAuthenticated, async (req, res) => {
	let userData = req.body;
	userData.password = await bcrypt.hash(userData.password, 10);
	const user = await userCollection.findOne({ $or: [{ username: userData.username }, { email: userData.email }] });
	if (user === null) {
		new userCollection(userData).save((err) => {
			if (err) {
				req.flash('error','Unknown error in creating account.')
				res.redirect('/user/register')
			}
			else {
				console.log(chalk.green('Data inserted'));
				req.flash('success','Account created Succesfully.')
				res.redirect('/user/register')
			}
		});
	} else {
		if (user.email === userData.email)
			{
				req.flash('error','Email already used.')
				res.redirect('/user/register')
			}
		else if (user.username === userData.username)
			{
				req.flash('error','Username already taken.')
				res.redirect('/user/register')
			}
		else {
			req.flash('error','Unknown error in creating account.')
				res.redirect('/user/register')
		}
	}
});

router.get('/failed',authCheckers.checkUnAuthenticated, (req, res) => {
	res.redirect('/user/login')
});
router.get('/dashboard',authCheckers.checkAuthenticated, async (req, res) => {
	let userURLs ;
	if(req.user)
		userURLs = await shorturlCollection.find({ownerID:req.user._id})
	res.render('dashboard.ejs',{userURLs})
});

router.get('/dashboard/:linkid',authCheckers.checkAuthenticated,async(req,res)=>{
	let userURLs;
	if(req.user){
		userURLs = await (shorturlCollection.findOne({ownerID:req.user._id,_id:req.params.linkid}))
		let last_date = new Date()
		let label = []
		let data = []
		for(let i=0;i<7;i++){
			let flag = false;
			label.push(dateformat(addDays(i,last_date),date_format))
			let nov = 0;
			for (const {dateOfVisit,numberOfVisits} of userURLs.dated){
				if(compareDates(dateOfVisit,addDays(i,last_date))){
					nov = numberOfVisits
					break;
				}
				else{
					continue
				}
			}
			data.push(nov)
		}
		label = label.reverse();
		data = data.reverse();
		res.render('linkinfo.ejs',{userURLs,label,data})
		
	}
})

const addDays = (days,date) => {
	const result = new Date(date);
  
	result.setDate(result.getDate() - days);
  
	return result;
  };
function compareDates(d1,d2) {
    if(d1.getFullYear() === d2.getFullYear() && d1.getMonth()===d2.getMonth() && d1.getDate()===d2.getDate()){
        return true;
    }
    else{
        return false;
    }
}

router.post(
	'/login',
	authCheckers.checkUnAuthenticated,
	passport.authenticate('local', { successRedirect: '/user/dashboard', failureRedirect: '/user/failed', failureFlash: true })
);

router.get('/logout',authCheckers.checkAuthenticated,(req,res)=>{
	req.logout();
	res.redirect('/')
})

module.exports = router;
