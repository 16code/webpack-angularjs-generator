import uiRouter from 'angular-ui-router';
import oclazyload from 'oclazyload';
// 依赖模块
const modules = [
    uiRouter,
    oclazyload
];
export default angular.module('App', modules);
