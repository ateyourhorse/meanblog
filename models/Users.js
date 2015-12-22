var mongoose = require('mongoose');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, lowercase: true},
	hash: String,
	salt: String
});

UserSchema.methods.setPassword = function(password) {
	var salt = bcryptjs.genSaltSync(10);
	this.salt = salt;
	this.hash = bcryptjs.hashSync(password, salt);
};

UserSchema.methods.validPassword = function(password) {
	var hash = bcryptjs.hashSync(password, this.salt);
	if (hash !== this.hash)
		return false
	return true;
};

UserSchema.methods.generateJwt = function() {
	// expire in 7 days
	var today = new Date();
	var expire = new Date(today);
	expire.setDate(today.getDate() + 7);
	
	return jwt.sign({
		_id: this._id,
		username: this.username,
		exp: parseInt(expire.getTime()/1000)	
		},
		'supersecretkey'
	);
};

mongoose.model('User', UserSchema);
