'use strict';

var app = angular.module('meanBlog');

app.controller('AuthCtrl', function($scope, $state, auth) {
	$scope.user = {};

	$scope.register = function() {
		auth.register($scope.user).error( function(error) {
			$scope.error = error;
		}).then( function() {
			$state.go('home');
		});
	};
	
	$scope.login = function() {
		auth.login($scope.user).error( function(error) {
			$scope.error = error;
		}).then( function() {
			$state.go('home');
		});
	};
});

app.controller('NavCtrl', function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logout = auth.logout;
});

app.controller('MainCtrl', function($scope, auth, blogs){
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.isOwner = function(owner) {
		return auth.currentUser() === owner;
	};

	$scope.blogs = blogs.blogs;

	$scope.addBlog = function(){
		if ( !$scope.title || $scope.title === '' )
			return;
		blogs.create( { title: $scope.title } );
		$scope.title = '';
	};

	$scope.deleteBlog = function(blog) {
		if (confirm('Really delete \'' + blog.title + '\'?'))
			blogs.deleteBlog(blog);
	};
});

app.controller('BlogsCtrl', function($scope, $state, auth, blogs, blog, Upload) {
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.isOwner = function () {
		return auth.currentUser() === blog.owner;
	};

	$scope.blog = blog;

	$scope.addPost = function(file){
		if ( !$scope.body || $scope.body === '' )
			return;

		var post = {body: $scope.body};

		if (file)
		{
			post.file = file;
			Upload.upload({
				url: 'api/blogs/' + blog._id + '/posts',
				headers: {Authorization: 'Bearer '+auth.getToken()},
				data: post
			}).then( function (res) {
				// Just reload to get the image from the db
				$state.reload();
			}, function (res) {
				$scope.error = 'Failed to add post';			
			});
		} else {
			blogs.createPost(blog._id, post)
			.success( function(post) {
				$scope.blog.posts.push(post);
			}).error( function(error) {
				$scope.error = error;
			});
		}
		$scope.body = '';
		$scope.file = '';
	};

	$scope.deletePost = function(post) {
		if (confirm('Really delete this post?'))
			blogs.deletePost( blog, post )
			.success( function() {
				blog.posts.splice(blog.posts.indexOf(post), 1);
			});
	};
});

