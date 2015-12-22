'use strict';

var app = angular.module('meanBlog', ['ui.router']);

app.config( function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: '/partials/home',
		controller: 'MainCtrl',
		resolve: {
			blogsPromise: function(blogs) {
				return blogs.getAll();
			}
		}
	});

	$stateProvider.state('blogs', {
		url: '/blogs/{id}',
		templateUrl: '/partials/blogs',
		controller: 'BlogsCtrl',
		resolve: {
			blog: function($stateParams, blogs) {
				return blogs.get($stateParams.id);
			}
		}
	});

	$stateProvider.state('register', {
		url: '/register',
		templateUrl: '/partials/register',
		controller: 'AuthCtrl',
		onEnter: function($state, auth) {
			if (auth.isLoggedIn())
				$state.go('home');
		}
	});

	$stateProvider.state('login', {
		url: '/login',
		templateUrl: '/partials/login',
		controller: 'AuthCtrl',
		onEnter: function($state, auth) {
			if (auth.isLoggedIn())
				$state.go('home');
		}
	});

	$urlRouterProvider.otherwise('home');
});

