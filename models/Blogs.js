var mongoose = require('mongoose');

var BlogSchema = new mongoose.Schema({
	title: String,
	owner: String,
	posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
});

mongoose.model('Blog', BlogSchema);
