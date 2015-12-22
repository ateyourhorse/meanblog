'use strict';
var app = angular.module('meanBlog');

app.factory('auth', function($http, $window){
	var auth = {};

	auth.saveToken = function (token) {
		$window.localStorage['meanBlog-token'] = token;
	};

	auth.getToken = function () {
		return $window.localStorage['meanBlog-token'];
	};

	auth.isLoggedIn = function() {
		var token = auth.getToken();
		if (!token)
			return false
		var payload = JSON.parse($window.atob(token.split('.')[1]));
		return payload.exp > (Date.now()/1000); 
	};

	auth.currentUser = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.username;
		};
	};

	auth.register = function(user) {
		return $http.post('/api/register', user).success( function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.login = function(user) {
		return $http.post('/api/login', user).success( function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logout = function() {
		$window.localStorage.removeItem('meanBlog-token');
	};

	return auth;
});

app.factory('blogs', function($http, auth) {
	var blogs = { blogs: [] };

	blogs.getAll = function() {
		return $http.get('api/blogs')
		.then( function(res) {
			angular.copy(res.data, blogs.blogs);
		})
	};

	blogs.get = function(id) {
		return $http.get('api/blogs/' + id).then( function(res) {
			return res.data;
		});
	};

	blogs.create = function(blog) {
		return $http.post('api/blogs', blog,
			{headers: {Authorization: 'Bearer '+auth.getToken()}}
		).then( function(res) {
			blogs.blogs.push(res.data);
		}); 
	};

	blogs.deleteBlog = function(blog) {
		return $http.delete('api/blogs/' + blog._id,
			{headers: {Authorization: 'Bearer '+auth.getToken()}}
		).then( function(res) {
			angular.copy(res.data, blogs.blogs);
		});	
	};

	blogs.createPost = function(id, post) {
		return $http.post('api/blogs/' + id + '/posts', post,
			{headers: {Authorization: 'Bearer '+auth.getToken()}}
		);
	};

	blogs.deletePost = function(blog, post) {
		return $http.delete('api/blogs/' + blog._id + '/posts/' + post._id,
			{headers: {Authorization: 'Bearer '+auth.getToken()}}
		);
	};

	blogs.isLoggedIn = function() {
		return auth.isLoggedIn();
	};

	return blogs;
});
