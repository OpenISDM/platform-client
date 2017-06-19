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
    'Notify',
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
            checkProjectMembership = function() {

                console.log('!!! VMS Membership: Checked !!!');

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

                $http(Req).then(
                    function(response){

                        var vmshead = response.headers();

                        var cpmReq = {
                            method: 'GET', 
                            url: 'https://vms-dev.herokuapp.com/api/attending_projects', 
                            headers: {
                                'Content-Type': 'application/json', 
                                'X-VMS-API-Key': '581dba93a4dbafa42a682d36b015d8484622f8e3543623bec5a291f67f5ddff1',
                                'Authorization': vmshead.authorization
                            }
                        };

                        var checkproj = false;
                        $http(cpmReq).then(
                            function(response){
                                var vmsproj = response.data;
                                //console.log(vmsproj);

                                for (var i = vmsproj.data.length - 1; i >= 0; i--) {
                                    if (vmsproj.data[i].id == 72 || vmsproj.data[i].id == 22) {
                                    //22:台灣地震科學志工--環境災害志工報案系統 / 72:1012 test group
                                        checkproj = true;
                                        break;
                                    } 
                                }

                                if (checkproj==false) {
                                    console.log('!!! Project Membership: Fail !!!');
                                    Notify.notify("您尚未加入志工專案「台灣地震科學志工--環境災害志工報案系統」，請參閱「說明」。");
                                    handleRequestError();
                                } else {
                                    console.log('!!! Project Membership: Checked !!!');
                                    $http.post(Util.url('/oauth/token'), payload).then(handleRequestSuccess, handleRequestError);
                                }
                            }, handleRequestError);
                    }, handleRequestError);
            };
 
//-------------------------------------------------------------------------------------------------------------------------//

// Skip "checkProjectMembership" if Login as Admin
//-------------------------------------------------------------------------------------------------------------------------//           
            if (username !== 'admin') {

                $http.post(Util.url('/oauth/token'), payload).then(checkProjectMembership, handleRequestError);
                //checkProjectMembership();
                
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
