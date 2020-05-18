const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shorturlSchema = new Schema({
	fullURL: {
		type: String,
		required: true
	},
	shortURL: {
		type: String,
		required: true
	},
	customShortURL: {
		type: String,
		required: false
	},
	visits: {
		type: Number,
		required: true,
		default: 0
	},
	dated: 
	[
		{
			dateOfVisit: {
				type: Date,
				required: true,
			},
			numberOfVisits: {
				type: Number,
				required: false
			}
		}
	],
	ownerID: {
		type: String,
		required: true,
		default: 'Clickify'
	}
});

module.exports = mongoose.model('shortURLs', shorturlSchema);
