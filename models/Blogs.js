var mongoose = require('mongoose');

var BlogSchema = new mongoose.Schema({
	title: String,
	owner: String,
	posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
	date: {type: Date, default: Date.now}
});

mongoose.model('Blog', BlogSchema);
