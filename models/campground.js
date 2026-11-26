const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title cannot be blank.']
    },
    image: {
        type: String
    },
    price: {
		type: Number,
		required: [true, 'Price cannot be blank.'],
		min: [0, 'Price must be greater than or equal to zero.']    // error msg in the 2nd argument
	},
    description: {
        type: String
    },
    location: {
        type: String
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);