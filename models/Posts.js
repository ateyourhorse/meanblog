var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	body: String,
	author: String,
	blog: {type: mongoose.Schema.Types.ObjectId, ref: 'Blog'},
	date: {type: Date, default: Date.now}
});

mongoose.model('Post', PostSchema);
