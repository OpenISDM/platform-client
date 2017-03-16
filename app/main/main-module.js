angular.module('ushahidi.main', [
    'ushahidi.posts',
    'ushahidi.activity', 
    'ushahidi.intro', 
    'ushahidi.manage'
]);

require('./posts/posts-module.js');
require('./activity/activity-module.js');
require('./intro/intro-module.js');
require('./manage/manage-module.js');
