const express = require('express');
const shortid = require('shortid');
const chalk = require('chalk');
const passport = require('passport');
const bcrypt = require('bcrypt');
const authCheckers = require('../authCheckers')

const router = express.Router();
const shorturlCollection = require('../models/shorturls');
const userCollection = require('../models/users');

router.post('/addURL', async (req, res) => {
	let urlData = req.body;
	urlData.shortURL = shortid.generate();
	const shortURL = await shorturlCollection.findOne({ customShortURL: urlData.customShortURL });
	if (shortURL === null) {
		new shorturlCollection(urlData).save((err) => {
			if (err) console.log(chalk.red('Error in Inserting Data'));
			else {
				console.log(chalk.green('Data Inserted'));
				res.send({ done: true, message: 'succesfully inserted data' });
			}
		});
	} else {
		res.send({ done: false, message: 'customURL already Exists', status: 1901 });
	}
});
router.post('/register', async (req, res) => {
	let userData = req.body;
	userData.password = await bcrypt.hash(userData.password, 10);
	const user = await userCollection.findOne({ $or: [{ username: userData.username }, { email: userData.email }] });
	if (user === null) {
		new userCollection(userData).save((err) => {
			if (err) console.log(chalk.red('Unknown error in Inserting Data'));
			else {
				console.log(chalk.green('Data inserted'));
				res.send({ done: true, message: 'successfully inserted data' });
			}
		});
	} else {
		if (user.email === userData.email)
			res.send({ done: false, message: 'An account with this Email already exist.' });
		else if (user.username === userData.username)
			res.send({ done: false, message: 'An account with the username already exists' });
		else res.send({ done: false, message: 'Unknown error in Inserting data' });
	}
});

router.get('/failed', (req, res) => {
	res.send('Cannot Log In');
});
router.get('/',authCheckers.checkAuthenticated, (req, res) => {
	res.send('Logged IN');
});

router.post(
	'/login',
	passport.authenticate('local', { successRedirect: '/user/', failureRedirect: '/user/failed', failureFlash: true })
);

module.exports = router;
