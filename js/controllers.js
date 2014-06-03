'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
	
	/**********************************************************************
	 * Main Controller  --- Do we really need this???
	 **********************************************************************/
	controller('MainCtrl', function($scope) {

	}).

/**********************************************************************
 * Login controller
 **********************************************************************/

    controller('NavCtrl', function ($rootScope, $scope, AuthService) {
      
      $scope.loggedIn = AuthService.isLoggedIn();
      
      $scope.logout = function(){
        AuthService.logout();
        $rootScope.$broadcast('logout');
      };

      $rootScope.$on('loggedin', function(){
          $scope.loggedIn = true;
      });

      $rootScope.$on('loggedout', function(){
          $scope.loggedIn = false;
      });

    }).

    controller('LoginCtrl', function($scope, $rootScope, $location, AuthService) {
      // This object will be filled by the form
      $scope.user = {};
      $scope.error = $rootScope.flash;

      // Register the login() function
      $scope.login = function(){
        AuthService.login($scope.user.username, $scope.user.password)
        .then(function(user){
          // No error: authentication OK
          $rootScope.$broadcast('loggedin');
          $location.url('/dashboard');
        },
        function(message){
          // Error: authentication failed
          $scope.error = message;
        });
      };

      $rootScope.$on('logout', function(){
        AuthService.logout().
        then(function(){
          $scope.loggedIn = false;
        });
      });

    }).

    /*
     * Controller for the register/signup form
     */
    controller('SignupCtrl', function($scope, $rootScope, $location, AuthService) {
        //Signup form object
        $scope.user = {};

        //Signup handler
        $scope.signup = function(){

            var username = $scope.user.username,
                email    = $scope.user.email,
                fullname = $scope.user.fullname,
                password = $scope.user.password;

            AuthService.signup(username, email, fullname, password)
            .success(function(user){
                //Redirect to login page after registration is succesful
                $rootScope.message = 'Signup successful, Please check you email';
                $location.url('/login');
            })
            .error(function(error){
                // In case of error while creating the account, show the flash message
                // this can happen if the primary key for the user username/email already
                // exists
                $rootScope.message = error.message;
            })
        };
    }).
    
    controller('FileCtrl', function($scope, $modal, FileService, ngTableParams) {
        FileService.get().then(function(data){
            $scope.files = data.data;
            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10           // count per page
                }, 
                {
                    total: $scope.files.length, // length of data
                    getData: function($defer, params) {
                        $defer.resolve($scope.files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
        });

        $scope.edit = function(file_index){
            var file = $scope.files[0];
            var modalInstance = $modal.open({
                templateUrl: 'partials/file_classify.tpl.html'
            });
        };


        $scope.allfiles = {'checked': false, selected: {}};

        // Select all the checkboxes when the checkbox header is changed;
        $scope.$watch('allfiles.checked', function(value){
            angular.forEach($scope.files,  function(file){
                if (angular.isDefined(file.id)) {
                  $scope.allfiles.selected[file.id] = value;
                }
            });
        });

        // These needs to be called whenever the checkbox of the any files
        // gets changed
        $scope.showLink = function(){
            if(_.map($scope.allfiles, function(value){
              return value;
            }).length > 1){
              return false;
            };
            return true;
        };
        
        // Enable the delete button in the sidebar only when atleast one file
        // gets selected
        $scope.showDelete = function(){
            return ! _.some($scope.allfiles, function(value){
              return value;
            });
        };

        //Deletes the multiple files
        $scope.delete = function(){
          var filesToDelete = Object.keys($scope.allfiles.selected);
          FileService.delete(filesToDelete).then(function(){
            //After the files are deleted, remove them from the $scope.files to
            //update the view
            angular.each($scope.files, function(file){
                if (_.contains(filesToDelete, file.id)){
                  $scope.files = _.without($scope.files, _.findWhere($scope.files, {id: file.id}));
                }
            });
          });
        };

        // Uploads the file when selected
        $scope.onFileSelect = function($files) {
            FileService.upload($files).then(function(){
              console.log('Uploaded all the files');
            });
        };
    }).

    controller('FileDetailsCtrl', function($scope, $rootScope, $location, AuthService, FileService, selectedFile) {
        $scope.selectedFile = {};

        if (selectedFile){
            $scope.selectedFile = selectedFile.data;
        } else{
            $scope.selectedFile = {};
        }

        // Save any changes made to this file
        $scope.publish = function(){
            var file = $scope.selectedFile;
            FileService.update(file);
        };
    });
