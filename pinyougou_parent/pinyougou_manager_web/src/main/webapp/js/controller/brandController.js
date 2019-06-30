app.controller("brandController",function ($scope,brandService,$controller) {

    $controller('baseController',{$scope:$scope} )

    $scope.findAll = function () {
        brandService.findAll().success(function (data) {
            $scope.list =data;
        })

    }

    //添加
    $scope.save=function () {
        var object  = brandService.save($scope.entity);
        if ($scope.entity.id != null){
            object = brandService.updat($scope.entity);
        }
        object.success(function (data) {
            if(data.success){
                $scope.reloadList();
            }else {
                alert(data.message);
            }
        })
    }

    //用Id查
    $scope.findOne = function (id) {
        brandService.findOne(id).success(function (data) {
            $scope.entity = data;
        })
    }


    $scope.dele=function (lists) {
        brandService.dele(lists).success(function (data) {
            if(data.success){
                $scope.reloadList();
            }else {
                alert(data.message);
            }
        })
    }
    $scope.selectMany = {};
    $scope.search=function (page,size) {
        brandService.findAllByMany(page,size,$scope.selectMany).success(function (data) {
            $scope.list = data.rows;
            $scope.paginationConf.totalItems = data.total;
        })
    }




})