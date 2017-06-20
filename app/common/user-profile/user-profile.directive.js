module.exports = [
    'UserEndpoint',
    'Notify',
    '_',
    '$translate',
    '$rootScope', // add $rootScope
    '$http', // add $http
    function (
        UserEndpoint,
        Notify,
        _,
        $translate, 
        $rootScope, 
        $http
    ) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: require('./user-profile.html'),
            link: function ($scope) {
                $scope.state = {
                    success: false,
                    processing: false,
                    changingPassword: false,
                    password: '' 
                };

                $scope.isAdmin = $rootScope.isAdmin; 

// ---------------------------------- Load VMS Profile ---------------------------------- //
                var vms_reqBody = {
                    "email": $rootScope.userEmail.toString(), 
                    "password": $rootScope.userPassword.toString()
                };

                var vms_Req = {
                    method: 'POST', 
                    url: 'https://vms-dev.herokuapp.com/api/auth', 
                    headers: {
                        'Content-Type': 'application/json', 
                        'X-VMS-API-Key': '581dba93a4dbafa42a682d36b015d8484622f8e3543623bec5a291f67f5ddff1'
                    }, 
                    data: JSON.stringify(vms_reqBody)
                };

                $http(vms_Req).then(
                    function(response){
                        console.log('!!! Load VMS Profile !!!');
                        $scope.vmsstate = response.data;
                    }, 
                    function(response){
                        console.log('!!! Load VMS Profile Fail !!!');
                    }
                );
// -------------------------------------------------------------------------------------- //

// ---------------------------------- Check User Location Post ---------------------------------- //
                var reqBody = {
                    "username": $rootScope.userEmail.toString(),
                    "password": $rootScope.userPassword.toString(), 
                    "grant_type": "password",
                    "client_id": "ushahidiui",
                    "client_secret": "35e7f0bca957836d05ca0492211b0ac707671261",
                    "scope": "posts media forms api tags savedsearches sets users stats layers config messages notifications contacts roles permissions csv dataproviders"
                };
                var Req = {
                    method: 'POST', 
                    url: 'http://140.109.22.155:3333/oauth/token', 
                    headers: {},
                    data: JSON.stringify(reqBody)
                };
                //Get Ushahidi access token
                $http(Req).then(
                    function(response) {
                        $scope.userToken = response.data.token_type.toString() + ' ' + response.data.access_token.toString();
                        var post_reqHead = {
                            'Content-Type': 'application/json', 
                            'Authorization': $scope.userToken
                        };
                        var post_Req = {
                            method: 'GET', 
                            url: 'http://140.109.22.155:3333/api/v3/posts?form=7&status=draft', 
                            headers: post_reqHead,
                        }; 
                        //Check if user location post exists 
                        $http(post_Req).then(
                            function(response) {
                                if ($scope.isAdmin()) { 
                                    $scope.curstate = {
                                        attend: false,
                                        location: '',
                                        phone: '',
                                        email: '',
                                        vehicle: ''
                                    };
                                } else {
                                    if (response.data.count==1) {
                                        console.log('!!! User Location Post Exists !!!');
                                        console.log('!!! Location Post ID: '+response.data.results[0].id+' !!!');
                                        $rootScope.userPostId = response.data.results[0].id;
                                        var templ = response.data.results[0].values['9b56eb4c-3374-4c13-842b-6c33f535eb8f']; 
                                        var tempp = response.data.results[0].values['ce7ff9e3-9f37-4f3a-aa29-7cc0ac1b4fa1']; 
                                        var tempe = response.data.results[0].values['7be1ac62-de02-49eb-a3fb-facaf8d44802']; 
                                        var tempv = response.data.results[0].values['fac18c33-451b-48cc-a085-745f63810868'];
                                        $scope.curstate = {
                                            attend: true,
                                            location: templ[0],
                                            phone: tempp[0],
                                            email: tempe[0],
                                            vehicle: tempv[0]
                                        };
                                        console.log($scope.curstate);
                                        $rootScope.curstate = $scope.curstate;

                                    } else if (response.data.count==0) { 
                                        console.log('!!! User Location Post Does Not Exist !!!');
                                        $scope.curstate = {
                                            attend: false,
                                            location: '',
                                            phone: '',
                                            email: '',
                                            vehicle: ''
                                        };
                                    } else {
                                        console.log('!!! The number of location posts is lager than 1 !!!'); 
                                    }
                                }
                            }, 
                            function(response) {
                                console.log('!!! Fail to check user location post !!!');
                            }
                        );
                    }, 
                    function(response) { 
                        console.log('!!! Fail to get ushahidi access token !!!');
                    }
                );
// ---------------------------------------------------------------------------------------------- //

                $scope.saveUser = function (user) {
                    $scope.state.success = false;
                    $scope.state.processing = true;

                    var userPayload = angular.copy(user);

                    // If we're not changing the password, drop that property from payload (just in case.)
                    if ($scope.state.changingPassword) {
                        userPayload.password = $scope.state.password;
                    }

                    var update = UserEndpoint.update({ id: 'me' }, userPayload);

                    update.$promise.then(function (user) {
                        Notify.notify('user_profile.update_success_ies');

                        $scope.state.success = true;
                        $scope.state.processing = false;

                        // Collapse password change form field.
                        $scope.state.changingPassword = false;
                        $scope.state.password = '';

                        $scope.user = user;

                        $scope.$emit('event:close');
                    }, function (errorResponse) { // error
                        Notify.apiErrors(errorResponse);
                        $scope.state.processing = false;
                    });

// ------------------------------------------------------ User Location Post ------------------------------------------------------ //
                    if ($scope.curstate.attend == true && typeof $rootScope.userPostId == 'undefined') { 

                        // ----------------------------------- Create User Location Post ----------------------------------- //

                        $scope.curstate.location = $rootScope.reportLocate;
                        $rootScope.curstate = $scope.curstate;

                        var reqBody = {
                            "username": $rootScope.userEmail.toString(),
                            "password": $rootScope.userPassword.toString(), 
                            "grant_type": "password",
                            "client_id": "ushahidiui",
                            "client_secret": "35e7f0bca957836d05ca0492211b0ac707671261",
                            "scope": "posts media forms api tags savedsearches sets users stats layers config messages notifications contacts roles permissions csv dataproviders"
                        };
                        var Req = {
                            method: 'POST', 
                            url: 'http://140.109.22.155:3333/oauth/token', 
                            headers: {},
                            data: JSON.stringify(reqBody)
                        }; 

                        // Get Ushahidi User Access Token
                        $http(Req).then(
                            function(response){
                                $scope.userToken = response.data.token_type.toString() + ' ' + response.data.access_token.toString();

                                var post_reqHead = {
                                    'Content-Type': 'application/json', 
                                    'Authorization': $scope.userToken
                                };
                                var vmsname = ''; 
                                vmsname = $scope.vmsstate.data.first_name.toString() + $scope.vmsstate.data.last_name.toString();
                                var vmsequip = '';
                                for (var i = $scope.vmsstate.data.equipment.length - 1; i >= 0; i--) {
                                    vmsequip = vmsequip + ' ' + $scope.vmsstate.data.equipment[i].name.toString();
                                }
                                var vmsskill = '';
                                for (var i = $scope.vmsstate.data.skills.length - 1; i >= 0; i--) {
                                    vmsskill = vmsskill + ' ' + $scope.vmsstate.data.skills[i].name.toString();
                                }
                                var vmsarea = $scope.vmsstate.data.city.name_en.toString() + ' ' + $scope.vmsstate.data.location.toString();
                                var post_time = new Date();
                                var post_reqBody = {
                                    "title":vmsname,
                                    "content":vmsname+"'s Current Location",
                                    "locale":"en_US",
                                    "values":
                                    {
                                        "ce7ff9e3-9f37-4f3a-aa29-7cc0ac1b4fa1":[$scope.curstate.phone], // current phone number
                                        "7be1ac62-de02-49eb-a3fb-facaf8d44802":[$scope.curstate.email], // current email
                                        "fac18c33-451b-48cc-a085-745f63810868":[$scope.curstate.vehicle], // current vehicles
                                        "9b56eb4c-3374-4c13-842b-6c33f535eb8f":[$scope.curstate.location], // current location
                                        "9600661d-ace4-4466-967e-5ffd3ffbe484":[vmsequip], // vms equipments
                                        "e428c435-0434-4bcb-ba41-9746ccde7cb8":[vmsskill], // vms skills
                                        "5d2350ff-a3e1-4e9e-939d-5ea9cfc2e98f":[vmsarea] // vms resident area 
                                    },
                                    "completed_stages":[],
                                    "published_to":[],
                                    "post_date":post_time,
                                    "form":
                                    {
                                        "id":7,
                                        "url":"http://140.109.22.155:3333/api/v3/forms/7",
                                        "parent_id":null,
                                        "name":"Management Map",
                                        "description":"Show all the members and their current information on map",
                                        "color":"#E69327",
                                        "type":"report",
                                        "disabled":false,
                                        "created":"2017-04-10T08:18:45+00:00",
                                        "updated":"2017-04-18T06:15:00+00:00",
                                        "require_approval":true,
                                        "everyone_can_create":false,
                                        "can_create":["admin"],
                                        "allowed_privileges":["read","create","update","delete","search"]
                                    },
                                    "allowed_privileges":["read","create","update","delete","search","change_status"],
                                    "tags":[]
                                }; 
                                var post_Req = {
                                    method: 'POST', 
                                    url: 'http://140.109.22.155:3333/api/v3/posts', 
                                    headers: post_reqHead,
                                    data: JSON.stringify(post_reqBody)
                                };

                                // Create Post 
                                $http(post_Req).then(
                                    function(response){
                                        $rootScope.userPostId = response.data.id;
                                        console.log('!!! Create Post '+$rootScope.userPostId+' !!!');
                                    }, 
                                    function(response){
                                        console.log('!!! Create Post Fail !!!');
                                    }
                                );
                            }, 
                            function(response){
                                console.log('!!! Get Ushahidi User Access Token Fail !!!');
                            }
                        );

                        // ------------------------------------------------------------------------------------------------- //           

                    } else if ($scope.curstate.attend == true && typeof $rootScope.userPostId !== 'undefined') { 

                        // ----------------------------------- Update User Location Post ----------------------------------- //

                        $scope.curstate.location = $rootScope.reportLocate;
                        $rootScope.curstate = $scope.curstate; 

                        var reqBody = {
                            "username": $rootScope.userEmail.toString(),
                            "password": $rootScope.userPassword.toString(), 
                            "grant_type": "password",
                            "client_id": "ushahidiui",
                            "client_secret": "35e7f0bca957836d05ca0492211b0ac707671261",
                            "scope": "posts media forms api tags savedsearches sets users stats layers config messages notifications contacts roles permissions csv dataproviders"
                        };
                        var Req = {
                            method: 'POST', 
                            url: 'http://140.109.22.155:3333/oauth/token', 
                            headers: {},
                            data: JSON.stringify(reqBody)
                        }; 

                        // Get Ushahidi User Access Token
                        $http(Req).then(
                            function(response){
                                $scope.userToken = response.data.token_type.toString() + ' ' + response.data.access_token.toString();

                                var post_reqHead = {
                                    'Content-Type': 'application/json', 
                                    'Authorization': $scope.userToken
                                };
                                var vmsname = ''; 
                                vmsname = $scope.vmsstate.data.first_name.toString() + $scope.vmsstate.data.last_name.toString();
                                var vmsequip = '';
                                for (var i = $scope.vmsstate.data.equipment.length - 1; i >= 0; i--) {
                                    vmsequip = vmsequip + ' ' + $scope.vmsstate.data.equipment[i].name.toString();
                                }
                                var vmsskill = '';
                                for (var i = $scope.vmsstate.data.skills.length - 1; i >= 0; i--) {
                                    vmsskill = vmsskill + ' ' + $scope.vmsstate.data.skills[i].name.toString();
                                }
                                var vmsarea = $scope.vmsstate.data.city.name_en.toString() + ' ' + $scope.vmsstate.data.location.toString();
                                var post_time = new Date();
                                var post_reqBody = {
                                    "id":$rootScope.userPostId,
                                    "title":vmsname,
                                    "content":vmsname+"'s Current Location",
                                    "locale":"en_US",
                                    "values":
                                    {
                                        "ce7ff9e3-9f37-4f3a-aa29-7cc0ac1b4fa1":[$scope.curstate.phone], // current phone number
                                        "7be1ac62-de02-49eb-a3fb-facaf8d44802":[$scope.curstate.email], // current email
                                        "fac18c33-451b-48cc-a085-745f63810868":[$scope.curstate.vehicle], // current vehicles
                                        "9b56eb4c-3374-4c13-842b-6c33f535eb8f":[$scope.curstate.location], // current location
                                        "9600661d-ace4-4466-967e-5ffd3ffbe484":[vmsequip], // vms equipments
                                        "e428c435-0434-4bcb-ba41-9746ccde7cb8":[vmsskill], // vms skills
                                        "5d2350ff-a3e1-4e9e-939d-5ea9cfc2e98f":[vmsarea] // vms resident area 
                                    },
                                    "completed_stages":[],
                                    "published_to":[],
                                    "post_date":post_time,
                                    "form":
                                    {
                                        "id":7,
                                        "url":"http://140.109.22.155:3333/api/v3/forms/7",
                                        "parent_id":null,
                                        "name":"Management Map",
                                        "description":"Show all the members and their current information on map",
                                        "color":"#E69327",
                                        "type":"report",
                                        "disabled":false,
                                        "created":"2017-04-10T08:18:45+00:00",
                                        "updated":"2017-04-18T06:15:00+00:00",
                                        "require_approval":true,
                                        "everyone_can_create":false,
                                        "can_create":["admin"],
                                        "allowed_privileges":["read","create","update","delete","search"]
                                    },
                                    "allowed_privileges":["read","create","update","delete","search","change_status"],
                                    "tags":[]
                                }; 
                                var post_Req = {
                                    method: 'PUT', 
                                    url: 'http://140.109.22.155:3333/api/v3/posts/'+$rootScope.userPostId.toString(), 
                                    headers: post_reqHead,
                                    data: JSON.stringify(post_reqBody)
                                };

                                // Update Post 
                                $http(post_Req).then(
                                    function(response){
                                        $rootScope.userPostId = response.data.id;
                                        console.log('!!! Update Post '+$rootScope.userPostId+' !!!');
                                    }, 
                                    function(response){
                                        console.log('!!! Update Post Fail !!!');
                                    }
                                );
                            }, 
                            function(response){
                                console.log('!!! Get Ushahidi User Access Token Fail !!!');
                            }
                        );
                        
                        // ------------------------------------------------------------------------------------------------- //

                    } else if ($scope.curstate.attend == false && typeof $rootScope.userPostId !== 'undefined') {

                        // ----------------------------------- Delete User Location Post ----------------------------------- // 

                        var reqBody = {
                            "username": $rootScope.userEmail.toString(),
                            "password": $rootScope.userPassword.toString(), 
                            "grant_type": "password",
                            "client_id": "ushahidiui",
                            "client_secret": "35e7f0bca957836d05ca0492211b0ac707671261",
                            "scope": "posts media forms api tags savedsearches sets users stats layers config messages notifications contacts roles permissions csv dataproviders"
                        };
                        var Req = {
                            method: 'POST', 
                            url: 'http://140.109.22.155:3333/oauth/token', 
                            headers: {},
                            data: JSON.stringify(reqBody)
                        }; 

                        // Get Ushahidi User Access Token
                        $http(Req).then(
                            function(response){
                                $scope.userToken = response.data.token_type.toString() + ' ' + response.data.access_token.toString();

                                var post_reqHead = {
                                    'Content-Type': 'application/json', 
                                    'Authorization': $scope.userToken
                                }; 
                                var post_Req = {
                                    method: 'DELETE', 
                                    url: 'http://140.109.22.155:3333/api/v3/posts/'+$rootScope.userPostId.toString(), 
                                    headers: post_reqHead
                                };

                                // Delete Post 
                                $http(post_Req).then(
                                    function(response){
                                        console.log('!!! Delete Post '+$rootScope.userPostId+' !!!');
                                        delete $rootScope.curstate;
                                        delete $rootScope.userPostId;
                                    }, 
                                    function(response){
                                        console.log('!!! Delete Post Fail !!!');
                                    }
                                );
                            }, 
                            function(response){
                                console.log('!!! Get Ushahidi User Access Token Fail !!!');
                            }
                        ); 

                        // ------------------------------------------------------------------------------------------------- //

                    } else {
                        // User isn't willing to report current location and also user location post doesn't exist.  
                    }
// -------------------------------------------------------------------------------------------------------------------------------- //

                };

                $scope.cancel = function () {
                    $scope.$emit('event:close');
                };

                $scope.user = UserEndpoint.getFresh({id: 'me'});

            }
        };
    }];
