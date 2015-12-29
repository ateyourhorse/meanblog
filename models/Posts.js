var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	body: {type: String, maxlength: [160, 'Enter a post containing {MAXLENGTH} characters or less.']},
	imageUrl: String,
	author: String,
	blog: {type: mongoose.Schema.Types.ObjectId, ref: 'Blog'},
	date: {type: Date, default: Date.now}
});

mongoose.model('Post', PostSchema);
