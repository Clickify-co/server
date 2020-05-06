// SENTRY
const sentry = require('@sentry/node');
const express = require('express');
const chalk = require('chalk');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const authCheckers = require('./authCheckers')
let app = express();

require('dotenv').config(); //Environment Configs

// CONFIGURE SENTRY
sentry.init({ dsn: 'https://1c683ce30a9a49699f2061a314493f1d@o386985.ingest.sentry.io/5221824' });

const intializePassport = require('./passportConfig'); //PASSPORT CONFIG

const userCollection = require('./models/users');

// mongoDBConnection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
	if (err) console.log(chalk.red('MongoDb Connection Error'));
	else console.log(chalk.blue('Connected to MongoDB'));
});
// mongoDBConnection

// Call Passport Initialize Function
intializePassport(
	passport,
	async (email) => await userCollection.findOne({ email: email }),
	async (id) => await userCollection.findOne({ username: id })
);
// Call Passport Intialize Function

// SERVER SETTINGS
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
	session({
		secret: 'RANDOMSECRET',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'))
app.set('view engine','ejs')
// SERVER SETTINGS

// MAKE SERVER TO LISTEN
app.listen(process.env.PORT || 3000, () => {
	console.log('Server is Listening at', chalk.red(process.env.PORT || 3000));
});
// MAKE SERVER TO LISTEN

// ROUTES
// Routes Import
let userRoutes = require('./routes/userRoutes');
app.use('/user/', userRoutes);
let shortRoutes = require('./routes/shortRoutes');
app.use('/', shortRoutes);

// Static Routes
app.get('/',(req, res) => {
	res.render('index.ejs')
});
app.get('/user/login',authCheckers.checkUnAuthenticated,(req,res)=>{
	res.render('login.ejs')
})
app.use('/user/register',authCheckers.checkUnAuthenticated,(req,res)=>{
	res.render('signup.ejs')
})
app.use(function(req, res, send) {
	res.status(404).render('404.ejs');
}	);
// ROUTES
