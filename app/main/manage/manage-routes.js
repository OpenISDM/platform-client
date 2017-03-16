module.exports = [
    '$routeProvider',
function (
    $routeProvider
) {

    $routeProvider
    .when('/manage', {
        controller: require('./manage.controller.js'),
        template: require('./manage.html')
    });

}];
