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

	$scope.blogs = blogs.blogs;

	$scope.addBlog = function(){
		if ( !$scope.title || $scope.title === '' )
			return;
		blogs.create( { title: $scope.title } );
		$scope.title = '';
	};

	$scope.deleteBlog = function(blog) {
		blogs.deleteBlog(blog);
	};
});

app.controller('BlogsCtrl', function($scope, auth, blogs, blog) {
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.blog = blog;

	$scope.addPost = function(){
		if ( !$scope.body || $scope.body === '' )
			return;
		blogs.createPost(
			blog._id,
			{ 
				body: $scope.body
			})
			.success( function(post) {
				$scope.blog.posts.push(post);
			});
		$scope.body = '';
	};

	$scope.deletePost = function(post) {
		blogs.deletePost( blog, post )
			.success( function() {
				blog.posts.splice(blog.posts.indexOf(post), 1);
			});
	};
});

