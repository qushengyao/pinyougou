app.controller('contentController' ,function($scope,contentService){

    $scope.contentList=[];
    $scope.findByCategoryId=function (categoryId) {
        contentService.findByCategoryId(categoryId).success(function (date) {
            $scope.contentList[categoryId]=date;
        })
    }

    $scope.search = function () {
        location.href="http://localhost:8099/search.html#?keywords="+$scope.keywords;
    }


})