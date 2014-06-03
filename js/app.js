'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.controllers', 
    'myApp.filters', 
    'myApp.services', 
    'myApp.directives', 'ngTable', 'angularFileUpload', 'ui.bootstrap', 'ngCookies']).

  config(['$routeProvider', function($routeProvider) {

    $routeProvider.when('/', 
    	{
    		templateUrl: 'partials/main.tpl.html', 
    	}
    );
    $routeProvider.when('/about', 
        {
            templateUrl: 'partials/about.tpl.html'
        }
    );
    $routeProvider.when('/files', 
        {
            templateUrl: 'partials/files.tpl.html',
            controller: 'FileCtrl'
        }
    );
    $routeProvider.when('/file/:fileId', 
        {
            templateUrl: 'partials/file_details.tpl.html',
            controller: 'FileDetailsCtrl',
            resolve: {
                selectedFile: function(FileLoader){
                    return FileLoader();
                }
            }
        }
    );
    $routeProvider.when('/signup', 
    	{
    		templateUrl: 'partials/register.tpl.html', 
    		controller: 'SignupCtrl'
    	}
    );
    $routeProvider.when('/login', 
    	{
    		templateUrl: 'partials/login.tpl.html', 
    		controller: 'LoginCtrl'
    	}
    );

    $routeProvider.otherwise({redirectTo: '/default'});

  }]).

run(function($rootScope, $location, AuthService){
    var authRoutes = ['/files', '/reports'];
    $rootScope.$on('$routeChangeStart', function(event, current, prev){
        var location = $location.path();
        if (authRoutes.indexOf(location) !== -1 && !AuthService.isLoggedIn()){
            $rootScope.flash = 'Login is required to acess this page';
            $location.path('/login');
        }
        else if(authRoutes.indexOf(location) !== -1 || location !== '/login'){
            $rootScope.flash = '';
        }
    });
})

.constant('USER_COOKIE_NAME', 'GETRTI_UER');
