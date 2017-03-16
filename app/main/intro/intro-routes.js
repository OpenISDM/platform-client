module.exports = [
    '$routeProvider',
function (
    $routeProvider
) {

    $routeProvider
    .when('/intro', {
        controller: require('./intro.controller.js'),
        template: require('./intro.html')
    });

}];
