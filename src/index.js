import uiRouter from 'angular-ui-router';
import oclazyload from 'oclazyload';
// 依赖模块
const modules = [
    uiRouter,
    oclazyload
];
// global __APP_NAME__:true
export default angular.module(__APP_NAME__, modules);
