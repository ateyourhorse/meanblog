'use strict';

var express = require('express');
var router = express.Router();

var passport = require('passport');
var expjwt = require('express-jwt');
var auth = expjwt({ secret: 'supersecretkey', userProperty: 'payload' });

var multer = require('multer');
var upload = multer({ dest: './tmp/'})
var Grid = require('gridfs-stream');
var fs = require('fs');

var mongoose = require('mongoose');
var Blog = mongoose.model('Blog');
var Post = mongoose.model('Post');
var User = mongoose.model('User');


router.post('/register', function(req, res, next) {
	if (!req.body.username || !req.body.password)
		return res.status(400).json({message: 'Please enter both a username and password'});

	User.findOne( { username: req.body.username }, function(err, user) {
		if (err)
			return next(err);
		if (user)
			return res.status(400).json({message: 'User already exists'});
			
		var user = new User( { username: req.body.username } );
		user.username = req.body.username;
		user.setPassword(req.body.password);

		user.save( function(err, user) {
			if (err)
				return next(err);
			var token = user.generateJwt();
			return res.json({ token: token });
		});	
	});
});

router.post('/login', function(req, res, next) {
	if (!req.body.username || !req.body.password)
		return res.status(400).json({message: 'Please enter both a username and password'});

	passport.authenticate('local', function(err, user, info) {
		if (err)
			return next(err);

		if (user) {
			var token = user.generateJwt();
			return res.json({ token: token });	
		}
		return res.status(401).json(info);
	})(req, res, next);
});

router.get('/blogs', function(req, res, next) {
	Blog.find(function(err, blogs) {
		if (err)
			return next(err);

		return res.json(blogs);
	});
});

router.post('/blogs', auth, function(req, res, next) {
	var blog = new Blog(req.body);
	blog.owner = req.payload.username;

	blog.save(function(err, blog) {
		if (err)
			return next(err);

		return res.json(blog);
	});
});

router.param('blog', function(req, res, next, id) {
	var query = Blog.findById(id);
	query.exec( function(err, blog) {
		if (err)
			return next(err);

		if (!blog)
			return next(new Error('Can\'t find blog'));
	
		req.blog = blog;
		next();
	});
});

router.get('/blogs/:blog', function(req, res, next) {
	req.blog.populate('posts', function(err, blog) {
		if (err)
			return next(err);

		return res.json(blog);
	});
});

router.delete('/blogs/:blog', auth, function(req, res, next) {
	if (req.blog.owner !== req.payload.username) {
		return res.status(401).json({message: 'Not authorized'});
	};

	req.blog.remove( function(err) {
		if (err)
			return next(err);

		// Return the remaining blogs
		Blog.find( function(err, blogs) {
			if (err)
				return next(err);
			res.json(blogs);
		});	
	});
});

router.post('/blogs/:blog/posts', auth, upload.single('file'), function(req, res, next) {
	var post = new Post(req.body);
	post.blog = req.blog;
	post.author = req.payload.username;

	if (post.blog.owner !== post.author)
	{
		return res.status(401).json({message: 'Not authorized'});
	};

	if (req.file) {
		var gfs = Grid(mongoose.connection.db, mongoose.mongo);

		var writestream = gfs.createWriteStream();
		fs.createReadStream(req.file.path).pipe(writestream);

		writestream.on('close', function(file) {
			post.imageUrl = 'api/images/' + file._id;
			post.validate( function(err) {
				if (err)
					return res.status(400).json(err.errors.body);

				post.save( function(err, post) {
					if (err)
						return next(err);

					req.blog.posts.push(post);
					req.blog.save( function(err, blog) {
						if (err)
							return next(err);

						res.json(post);
					});
				});
			});
		});

		writestream.on('error', function(err) {
			res.send(500).json(err);
		});
	} else {
		post.validate( function(err) {
			if (err)
				return res.status(400).json(err.errors.body);

			post.save( function(err, post) {
				if (err)
					return next(err);

				req.blog.posts.push(post);
				req.blog.save( function(err, blog) {
					if (err)
						return next(err);

					res.json(post);
				});
			});
		});
	};
});

router.param('post', function(req, res, next, id) {
	var query = Post.findById(id);
	query.exec( function(err, post) {
		if (err)
			return next(err);
		if (!post)
			return next(new Error('Can\'t find post'));

		req.post = post;
		next();
	});
});

router.delete('/blogs/:blog/posts/:post', auth, function(req, res, next) {
	if (req.blog.owner !== req.payload.username) {
		return res.status(401).json({message: 'Not authorized'});
	};

	req.blog.posts.splice(req.blog.posts.indexOf(req.post), 1);
	req.blog.save( function(err, blog) {
		if (err)
			return next(err);
		req.post.remove( function(err) {
			if (err)
				return next(err);
			res.json(res.post);	
		});
	});
});

router.get('/images/:image', function(req, res, next) {
	var gfs = Grid(mongoose.connection.db, mongoose.mongo);
	gfs.findOne( { _id: req.params.image }, function(err, image) {
		if (err || !image)
			return res.status(404).send('Not found');
	
		var readstream = gfs.createReadStream({
			_id: image._id
		});

		res.set('Content-Type', image.contentType);
		
		readstream.on('error', function(err) {
			res.send(500).json(err);
		});

		readstream.on('open', function() {
			readstream.pipe(res);
		});
	});
});

module.exports = router;
