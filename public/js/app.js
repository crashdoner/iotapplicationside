/* AngularJS APP for Room Reservation */

// configuration
var globalDebugFlag = true;
var regExpRootPath = new RegExp(/^.*\//);
var appRootPath = regExpRootPath.exec(window.location.href);


// loading module datatables
var appmodule = angular.module("mainapp", ['ui.bootstrap', 'n3-pie-chart', 'pageslide-directive' ]);



appmodule.controller('app', ['$scope', function($scope) {

  $scope.showDashboard = true; //this is the first page, so I set it to true
  // $scope.showOtherThings = false;


  $scope.changeView = function(idx) {

  	$scope.showDashboard = false;
  	// $scope.showOtherThings = false;

  	if (idx==1) {
  		$scope.showDashboard = true;
  	}
  	// if (idx==4) {
  	// 	$scope.showOtherThings = true;
  	// }
  };



}]);




appmodule.provider("Utils", function () {
	var provider = {};

    provider.$get = function ($filter) {

        var service = {};
        // utility method to check variable is null or undefined
        service.isUndefinedOrNull = function(obj) {
            return !angular.isDefined(obj) || obj===null;
        }

        service.isUndefined = function (obj) {
            return !angular.isDefined(obj);
        }

        // log function
        service.log = function(msg) {
            if (globalDebugFlag == undefined) {
                globalDebugFlag = true;
            }
            if (window.console && globalDebugFlag == true) {
                console.log(msg);
            }
            return;
        }

        // get root path
        service.getRootPath = function () {
            //this.log("getRootPath " + appRootPath);
            return appRootPath;
        }

        // modal gif loading
        service.showModalGif = function () {

        }

        service.hideModalGif = function () {

        }

        // modal message
        service.showModalMessage = function (type, title, message) {

        }

        service.hideModalMessage = function () {

        }

        service.parseBackendDate = function (date) {

        }

        /* Application constats definitions */
        var regExpRootPath = new RegExp(/^.*\//);
        var appRootPath = regExpRootPath.exec(window.location.href);
        //var appRootPath = "http://myapp.mybluemix.net/";
        var apiHost = appRootPath;
        var apiPath = 'api';

        service.constants = {
                 paths: {
                   apiFullPath: apiHost + apiPath,
                 },
                 apiName: {
                   status: "/status",
                   commandOne: "/commandone",
                   commandTwo: "/commandtwo"
                 },
                 menuitems: {
                   // what is section: imports 1 - configuration 2 - stats 3
                   // main sections PRT 1 - MOR 2 - RTC 3 - CSAT 4 - login 5
                   // subsection: progressive
                   // firstPage: 0,

                 }

               };

        return service;

}

return provider;
});
