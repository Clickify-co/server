const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shorturlSchema = new Schema({
	linkTitle: {
		type: String,
		required: false,
		default: 'Untitled'
	},
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
	creationDate: {
		type: Date,
		required: false,
		default: new Date()
	},
	ownerID: {
		type: String,
		required: true,
		default: 'Clickify'
	}
});

module.exports = mongoose.model('shortURLs', shorturlSchema);
