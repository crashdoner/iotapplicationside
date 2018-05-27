/* module book-by-date */

(function (ng, app) {

        var appmodule = ng.module("mainapp");

        // TEMPLATES

        appmodule.directive('dashboard', function ($rootScope) {
          return {
            restrict: 'AE',
            transclude: true,
            scope: {
                selectedActivity: '='
            },
            controller: ['$scope', 'Utils', '$interval', '$http', function($scope, Utils, $interval, $http) {

              $scope.debugChecked=true;


              /* init Pie chart */
              $scope.pieChartOptions = {thickness: 12, mode: "gauge", total: 100}; //pie-chart option
              var valueTempInit = 0;
              var valueHumInit  = 0;
              var valuePressInit = 0;
              var valueLumInit = 0;
              $scope.dataTemp =  [ {label: "Temp", value: valueTempInit, color: "#4adbc8", suffix: "°"} ];
              $scope.dataHumidity = [ {label: "Humidity", value: valueHumInit, color: "#4adbc8", suffix: "%"} ];
              $scope.dataPress = [ {label: "Pressure", value: valueHumInit, color: "#4adbc8", suffix: "%"} ];
              $scope.dataLum = [ {label: "Luminosity", value: valueHumInit, color: "#4adbc8", suffix: "%"} ];
              /***/


           var intervalStatusInformationPromise; //used for store the interval promise
            function getRandomArbitrary(min, max) {
                return Math.floor(Math.random() * (max - min) + min);
            }


              $scope.allReceivedAndSentMessages = [];
                $scope.updateStatusInformation = function () {

                  // var xsrf = {
                  //   limit: limit,
                  //   type: Utils.constants.type
                  // };

                    $http({
                        method: 'GET',
                        //params: xsrf,
                        url: Utils.constants.paths.apiFullPath + Utils.constants.apiName.status,
                    }).then(function successCallback(response) { //** SUCCESS

                            if (response.data.returnCode == '200') {
                                Utils.log("Status information API - " + response.data.returnCode + ": " + response.data.message);

                                var bodyResponse = response.data.body
                                $scope.dataTemp[0].value      =  bodyResponse.d.temperature;
                                $scope.dataHumidity[0].value  =  bodyResponse.d.humidity;
                                $scope.dataPress[0].value     =  bodyResponse.d.pressure;
                                $scope.dataLum[0].value       =  bodyResponse.d.luminosity;

                                $scope.allReceivedAndSentMessages.push("Received Message: " + JSON.stringify(bodyResponse) + "-------------------------------");
                            }
                            else {
                                $scope.addAlert('danger', response.data.returnCode + ": " + response.data.message);
                            }

                        }, function errorCallback(response) { //** ERROR
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            $scope.addAlert('danger', "Server error");
                        });
                };


             $scope.stopUpdateStatusInformation = function () {
                $interval.cancel(intervalProgressBarPromise);
                console.log('$scope.updateStatusInformationr() - Interval stopped');
             }

             intervalStatusInformationPromise = $interval( function(){ $scope.updateStatusInformation(); }, 1000);

            /*****/
              $scope.updateStatusInformation();


              /* send commands API */
              /********************/
              $scope.commandOne = function() {
                  $http({
                      method: 'GET',
                      //params: xsrf,
                      url: Utils.constants.paths.apiFullPath + Utils.constants.apiName.commandOne,
                  }).then(function successCallback(response) { //** SUCCESS
                      if (response.data.returnCode == '200') {
                          Utils.log("Command One API - " + response.data.returnCode + ": " + response.data.message);
                      }
                      else {
                          $scope.addAlert('danger', response.data.returnCode + ": " + response.data.message);
                      }
                  }, function errorCallback(response) { //** ERROR
                      // called asynchronously if an error occurs
                      // or server returns response with an error status.
                      $scope.addAlert('danger', "Server error");
                  });
              };


              $scope.commandTwo = function() {
                  $http({
                      method: 'GET',
                      //params: xsrf,
                      url: Utils.constants.paths.apiFullPath + Utils.constants.apiName.commandTwo,
                  }).then(function successCallback(response) { //** SUCCESS
                      if (response.data.returnCode == '200') {
                          Utils.log("Command Two API - " + response.data.returnCode + ": " + response.data.message);
                      }
                      else {
                          $scope.addAlert('danger', response.data.returnCode + ": " + response.data.message);
                      }
                  }, function errorCallback(response) { //** ERROR
                      // called asynchronously if an error occurs
                      // or server returns response with an error status.
                      $scope.addAlert('danger', "Server error");
                  });
              };

              $scope.clear = function() {
                $scope.mytimestart = null;
                $scope.mytimeend = null;
              };

              $scope.alerts = [];

              $scope.addAlert = function(type, message) {
                    $scope.alerts.push({type: type, msg: message});
              };

              $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
              };

              $scope.cleanAlerts = function() {
                $scope.alerts = [];
              }


            }],
            controllerAs: 'dashboardCRTL',
            templateUrl: 'templates/dashboard.html'
          };
        });
})(angular, appmodule);
