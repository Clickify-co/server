const express = require('express');
const shortid = require('shortid');
const chalk = require('chalk');
const passport = require('passport');
const bcrypt = require('bcrypt');
const dateformat = require('dateformat');
const authCheckers = require('../authCheckers');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const date_format = 'dd-mm-yyyy';

const shorturlCollection = require('../models/shorturls');
const userCollection = require('../models/users');




router.get('/profile', authCheckers.checkAuthenticated, (req, res) => {
	res.render('profile.ejs', { user: req.user })
})

router.get('/dashboard/delete/:urlID', authCheckers.checkAuthenticated, async (req, res) => {
	const shortURL = await shorturlCollection.findById(req.params.urlID);
	if (!shortURL) {
		req.flash('error', "Link can't be deleted. No link exist with the provided ID.");
		res.redirect('/user/dashboard');
	} else {
		if (shortURL.ownerID === req.user._id) {
			shorturlCollection.deleteOne({ _id: req.params.urlID }, (err) => {
				if (err) {
					req.flash('error', err);
					res.redirect('/user/dashboard');
				} else {
					req.flash('success', 'URL deleted Succesfully');
					res.redirect('/user/dashboard');
				}
			});
		} else {
			req.flash('error', "UhOh! You're not the owner of this Link.");
			res.redirect('/user/dashboard');
		}
	}
});

router.post('/editProfile', authCheckers.checkAuthenticated, [check('email').isEmail(), check('password').isLength({ min: 6 }), check('firstName').isLength({ min: 2 }), check('lastName').isLength({ min: 2 })],async (req, res) => {
	const validationErrors = validationResult(req);
	if (!validationErrors.isEmpty()) {
		let validationErrorsArray = validationErrors.array();
		if (validationErrorsArray[0].param === 'email') {
			req.flash('error', 'Invalid Email Address');
		} else if (validationErrorsArray[0].param === 'password') {
			req.flash('error', 'Current Password must contain atleast 6 characters.');
		}
		else {
			req.flash('error', 'Please enter a valid name.')
		}

		if(req.body.newPassword.length > 0 && req.body.newPassword.length <6){
			req.flash('error', 'New Password must contain atleast 6 characters.');
		}
		res.redirect('/user/profile');
	}
	else{
		if (await bcrypt.compare(req.body.password, req.user.password)) {
			req.body.fullName = { firstName: req.body.firstName, lastName: req.body.lastName }
			if (req.body.newPassword) {
				req.body.password = await bcrypt.hash(req.body.newPassword, 10)
			}
			else{
				req.body.password = await bcrypt.hash(req.body.password , 10)
			}
			userCollection.updateOne({ _id: req.user._id }, req.body, (err) => {
				if (err) {
					if(err.name === 'MongoError' && err.code === 11000){
						if(err.keyPattern.email){
							req.flash('error','This Email is already in use')
						}
						if(err.keyPattern.username){
							req.flash('error','This username is already in use.')
						}
					}
					else{
					req.flash('error', 'Unknown Error occured while saving changes.')
					}
					res.redirect('/user/profile')
				}
				else {
					req.flash('success', 'Profile Chnages has been saved succesfully')
					res.redirect('/user/profile')
				}
			})
	
		}
		else {
			req.flash('error', 'Current password is incorrect')
			res.redirect('/user/profile')
		}
	}
})

router.post('/editURL', authCheckers.checkAuthenticated, async (req, res) => {
	const shortURL = await shorturlCollection.findById(req.body.urlID);
	if (shortURL === null) {
		req.flash('error', 'We could not find the URL');
		res.redirect('/user/dashboard');
	} else {
		shortURL.customShortURL = req.body.customShortURL;
		shortURL.linkTitle = req.body.linkTitle;
		shortURL.save().then(() => {
			req.flash('success', 'Custom URL updated');
			res.redirect('/user/dashboard/' + req.body.urlID);
		});
	}
});
router.post('/addURL', authCheckers.checkAuthenticated, async (req, res) => {
	let urlData = req.body;
	if (req.user) {
		urlData.ownerID = req.user._id;
	}
	urlData.creationDate = new Date();
	urlData.shortURL = shortid.generate();
	const shortURL = null;
	if (req.body.customShortURL)
		shortURL = await shorturlCollection.findOne({ customShortURL: urlData.customShortURL });
	if (shortURL === null) {
		new shorturlCollection(urlData).save((err) => {
			if (err) console.log(chalk.red(err));
			else {
				req.flash('success', 'Shortlink generated.');
				res.redirect('/user/dashboard');
			}
		});
	} else {
		res.send({ done: false, message: 'customURL already Exists', status: 1901 });
	}
});
router.post(
	'/register',
	authCheckers.checkUnAuthenticated,
	[check('email').isEmail(), check('password').isLength({ min: 6 }), check('firstName').isLength({ min: 2 }), check('lastName').isLength({ min: 2 })],
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			let validationErrorsArray = validationErrors.array();
			if (validationErrorsArray[0].param === 'email') {
				req.flash('error', 'Invalid Email Address');
			} else if (validationErrorsArray[0].param === 'password') {
				req.flash('error', 'Password must contain atleast 6 characters.');
			}
			else {
				req.flash('error', 'Please enter a valid name.')
			}
			res.redirect('/user/register');
		} else {
			let userData = req.body;
			userData.fullName = { firstName: userData.firstName, lastName: userData.lastName }
			userData.password = await bcrypt.hash(userData.password, 10);
			userData.email = userData.email.toLowerCase();
			const user = await userCollection.findOne({
				$or: [{ username: userData.username }, { email: userData.email }]
			});
			if (user === null) {
				new userCollection(userData).save((err) => {
					if (err) {
						req.flash('error', 'Unknown error in creating account.');
						res.redirect('/user/register');
					} else {
						console.log(chalk.green('Data inserted'));
						req.flash('success', 'Account created Succesfully.');
						res.redirect('/user/register');
					}
				});
			} else {
				if (user.email === userData.email) {
					req.flash('error', 'Email already used.');
					res.redirect('/user/register');
				} else if (user.username === userData.username) {
					req.flash('error', 'Username already taken.');
					res.redirect('/user/register');
				} else {
					req.flash('error', 'Unknown error in creating account.');
					res.redirect('/user/register');
				}
			}
		}
	}
);

router.get('/failed', authCheckers.checkUnAuthenticated, (req, res) => {
	res.redirect('/user/login');
});
router.get('/dashboard', authCheckers.checkAuthenticated, async (req, res) => {
	let userURLs;
	if (req.user) userURLs = await shorturlCollection.find({ ownerID: req.user._id });
	res.render('dashboard.ejs', { userURLs });
});

router.get('/dashboard/:linkid', authCheckers.checkAuthenticated, async (req, res) => {
	let userURLs;
	if (req.user) {
		userURLs = await shorturlCollection.findOne({ ownerID: req.user._id, _id: req.params.linkid });
		if (userURLs) {
			let last_date = new Date();
			let label = [];
			let data = [];
			for (let i = 0; i < 14; i++) {
				let flag = false;
				if (userURLs.creationDate) {
					//Do Nothing
				} else {
					userURLs.creationDate = addDays(14, last_date);
				}
				if (compareDates(userURLs.creationDate, addDays(i, last_date))) {
					label.push(dateformat(addDays(i, last_date), date_format));
					let nov = 0;
					for (const { dateOfVisit, numberOfVisits } of userURLs.dated) {
						if (compareDates(dateOfVisit, addDays(i, last_date))) {
							nov = numberOfVisits;
							break;
						} else {
							continue;
						}
					}
					data.push(nov);
					break;
				} else {
					label.push(dateformat(addDays(i, last_date), date_format));
					let nov = 0;
					for (const { dateOfVisit, numberOfVisits } of userURLs.dated) {
						if (compareDates(dateOfVisit, addDays(i, last_date))) {
							nov = numberOfVisits;
							break;
						} else {
							continue;
						}
					}
					data.push(nov);
				}
			}
			label = label.reverse();
			data = data.reverse();
			let creationDate = dateformat(userURLs.creationDate, 'mmm dd, hh:MM TT');
			res.render('linkinfo.ejs', { userURLs, label, data, creationDate, ownerName: req.user.username });
		}
	}
});

const addDays = (days, date) => {
	const result = new Date(date);

	result.setDate(result.getDate() - days);

	return result;
};
function compareDates(d1, d2) {
	if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()) {
		return true;
	} else {
		return false;
	}
}

router.post(
	'/login',
	authCheckers.checkUnAuthenticated,
	passport.authenticate('local', {
		successRedirect: '/user/dashboard',
		failureRedirect: '/user/failed',
		failureFlash: true
	})
);

router.get('/logout', authCheckers.checkAuthenticated, (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
