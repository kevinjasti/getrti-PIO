'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  
factory('AuthService', function($http, $q, $timeout, SessionService, USER_COOKIE_NAME){
	
	var cacheSession = function(user){
		SessionService.set(USER_COOKIE_NAME, user);
	};
	var uncacheSession = function(){
		SessionService.unset(USER_COOKIE_NAME);
	};

	//Hook up with the server api here
	return {
		login: function(username, password){
			var defer = $q.defer();
			$timeout(function(){
				if(username =='getRTI' && password == 'getRTI'){
					cacheSession(username);
					return defer.resolve();
				}else {
					return defer.reject('Username and password doesn\'t match');
				}
			}, 5);
			return defer.promise;
		},
		logout: function(){
			var defer = $q.defer();
			uncacheSession();
			return defer.resolve();
		},
		signup: function(credentials){
			return $http.post('http://localhost:3000/register', credentials);
		},
		isLoggedIn: function(){
			return !!SessionService.get(USER_COOKIE_NAME);
		}
	}
}).

//Gets the details about the files
factory('FileService', function($http, $upload, $q){
	//Hook up with the server api here
	return {
		//Returns all the files available 
		get: function(){
			return $http.get('http://localhost:3000/files');
		},
		// Uploads the new files through form data
		upload: function(files){
			var defer = $q.defer();
			var filePromises = [];

			 //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < files.length; i++) {
              var file = files[i];          
              var promise = $upload.upload({
                url: '/file', //upload.php script, node.js route, or servlet url
                method: 'PUT',
                // headers: {'headerKey': 'headerValue'}, withCredential: true,
                file: file,
                data : {
                	name: file.name
                },
                fileFormDataName: 'file'
                // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
                /* set file formData name for 'Content-Desposition' header. Default: 'file' */
                //fileFormDataName: myFile,
                /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
                //formDataAppender: function(formData, key, val){} 
              }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
              });
              filePromises.push(promise);
          }
          
          //Wait for all files to get uploaded, once done resolve the my promise
          $q.all(filePromises).then(function(data){
          	 return defer.resolve(data);
          }, function(){
          	 return defer.reject();
          });

          return defer.promise;
		},
		// Updates the existing data for the file
		update: function(file){
			return $http.post('http://localhost:3000/file/' + file.id, file);
		},
		//Gets the detailed information about the file
		get_details: function(fileId){
			return $http.get('http://localhost:3000/file/' + fileId);
		},
		delete: function(fileId){
			return $http.delete('http://localhost:3000/file/' + fileId);
		}
	}
}).

factory('FileLoader', function ($route, $q, $http) {
	return function(){
		var fileId = $route.current.params.fileId;
		return $http.get('/file/' + fileId);
	};
}).

factory('SessionService', ['$cookieStore', function ($cookieStore) {
	
	return {
		get: function(key){
			return $cookieStore.get(key);
		},
		set: function(key, val){
			$cookieStore.put(key, val);
		},
		unset: function(key){
			$cookieStore.put(key, undefined);
		}
	};
}]).

// Search interface
factory('SearchService', function($location, $http){
	return {
		query: function(seach_term){
			return $http.get('http://localhost:3000/search/:' + seach_term);
		}
	}
}).

factory("FlashService", function($rootScope) {
  return {
    show: function(message) {
      $rootScope.flash = message;
    },
    clear: function() {
      $rootScope.flash = "";
    }
  }
});


