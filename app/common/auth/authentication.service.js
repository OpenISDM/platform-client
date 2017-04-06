module.exports = [
    '$rootScope',
    '$http',
    '$q',
    'Util',
    'CONST',
    'Session',
    'RoleEndpoint',
    'UserEndpoint',
    '_',
    'ModalService',
    'Notify', //add service "Notify"
function (
    $rootScope,
    $http,
    $q,
    Util,
    CONST,
    Session,
    RoleEndpoint,
    UserEndpoint,
    _,
    ModalService, 
    Notify
) {

    // check whether we have initially an old access_token and userId
    // and assume that, if yes, we are still loggedin
    var loginStatus = !!Session.getSessionDataEntry('accessToken') && !!Session.getSessionDataEntry('userId'),


    setToLoginState = function (userData) {
        Session.setSessionDataEntries({
            userId: userData.id,
            realname: userData.realname,
            email: userData.email,
            role: userData.role,
            permissions: userData.permissions,
            gravatar: userData.gravatar
        });

        loginStatus = true;
    },

    setToLogoutState = function () {
        Session.clearSessionData();
        UserEndpoint.invalidateCache();
        loginStatus = false;
    };

    return {

        login: function (username, password) {

            console.log('!!! Enter Login Function !!!');

            var payload = {
                username: username,
                password: password,
                grant_type: 'password',
                client_id: CONST.OAUTH_CLIENT_ID,
                client_secret: CONST.OAUTH_CLIENT_SECRET,
                scope: CONST.CLAIMED_USER_SCOPES.join(' ')
            }, 

            deferred = $q.defer(),

            handleRequestError = function () {
                deferred.reject();
                setToLogoutState();
                $rootScope.$broadcast('event:authentication:login:failed');
            },

            handleRequestSuccess = function (authResponse) {
                var accessToken = authResponse.data.access_token;
                Session.setSessionDataEntry('accessToken', accessToken);

                $http.get(Util.apiUrl('/users/me')).then(
                    function (userDataResponse) {
                        RoleEndpoint.query({name: userDataResponse.data.role}).$promise
                        .then(function (results) {
                            userDataResponse.data.permissions = !_.isEmpty(results) ? results[0].permissions : [];
                            return userDataResponse;
                        })
                        .catch(function (errors) {
                            userDataResponse.data.permissions = [];
                            return userDataResponse;
                        })
                        .finally(function () {
                            setToLoginState(userDataResponse.data);
                            $rootScope.$broadcast('event:authentication:login:succeeded'); 
                            deferred.resolve();
                        });
                    }, handleRequestError);
            }, 

// Check IES-TSER Project Membership
//-------------------------------------------------------------------------------------------------------------------------//
            checkProjectMembership = function(response) {
                var vmshead = response.headers();

                var Req = {
                    method: 'GET', 
                    url: 'https://vms-dev.herokuapp.com/api/attending_projects', 
                    headers: {
                        'Content-Type': 'application/json', 
                        'X-VMS-API-Key': '581dba93a4dbafa42a682d36b015d8484622f8e3543623bec5a291f67f5ddff1',
                        'Authorization': vmshead.authorization
                    }
                };

                var checkproj = false;
                $http(Req).then(
                    function(response){
                        var vmsproj = response.data;
                        //console.log(vmsproj);

                        for (var i = vmsproj.data.length - 1; i >= 0; i--) {
                            if (vmsproj.data[i].id == 72 || vmsproj.data[i].id == 22) {
                            //if (vmsproj.data[i].id == 1) {
                                checkproj = true;
                                console.log('!!! Project Membership: Checked !!!');
                                $http.post(Util.url('/oauth/token'), payload).then(handleRequestSuccess, handleRequestError);
                                break;
                            } 
                        }

                        if (checkproj==false) {
                            Notify.notify('Sorry, you are not a member of this project. Please join this project and login again.');
                            handleRequestError();
                        }
                    }, handleRequestError);
            };
 
//-------------------------------------------------------------------------------------------------------------------------//

// Skip "checkProjectMembership" if Login as Admin
//-------------------------------------------------------------------------------------------------------------------------//           
            if (username !== 'admin') {

                var credential = {
                    "email": username.toString(), 
                    "password": password.toString() 
                };

                var Req = {
                    method: 'POST', 
                    url: 'https://vms-dev.herokuapp.com/api/auth', 
                    headers: {
                        'Content-Type': 'application/json', 
                        'X-VMS-API-Key': '581dba93a4dbafa42a682d36b015d8484622f8e3543623bec5a291f67f5ddff1'
                    }, 
                    data: JSON.stringify(credential)
                };

                $http(Req).then(checkProjectMembership, handleRequestError);
                //$http.post(Req.url,Req.data,{headers:Req.headers}).then(checkProjectMembership, handleRequestError);
                
            } else {

                $http.post(Util.url('/oauth/token'), payload).then(handleRequestSuccess, handleRequestError);

            }

            return deferred.promise;
            
//-------------------------------------------------------------------------------------------------------------------------//

            //$http.post(Util.url('/oauth/token'), payload).then(handleRequestSuccess, handleRequestError);
            //return deferred.promise;
        },

        logout: function (silent) {
            //TODO: ASK THE BACKEND TO DESTROY SESSION

            setToLogoutState();
            if (!silent) {
                $rootScope.$broadcast('event:authentication:logout:succeeded');
            }
        },

        getLoginStatus: function () {
            return loginStatus;
        },

        openLogin: function () {

            ModalService.openTemplate('<login></login>', 'nav.login', false, false, false, false);
        }
    };

}];
