angular.module('ushahidi.user-profile', [])
.directive('accountSettings', require('./account-settings.directive.js'))
.directive('userProfile', require('./user-profile.directive.js'))
.directive('notifications', require('./notifications.directive.js'))
.directive('vmsProfile', require('./vms-profile.directive.js')) // add new page "vms profile" on user profile
.directive('reportLocation', require('./report-location.directive.js')) // add location tool on user profile
;
