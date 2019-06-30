app.controller("loginController",function ($scope,loginService) {


    $scope.loginName = function () {
        loginService.loginName().success(function (data) {
            $scope.loginName = data.loginName;
        })

    }
});