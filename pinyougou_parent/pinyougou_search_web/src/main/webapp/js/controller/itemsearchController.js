app.controller("itemsearchController",function ($scope,$location,itemsearchService) {

    $scope.searchMap={'keywords':'','category':'','brand':'','spec':{},'price':'','pageNo':1,'pageSize':30,'sort':'','sortField':''}

    $scope.search=function () {
        $scope.searchMap.pageNo =parseInt($scope.searchMap.pageNo);
        itemsearchService.search($scope.searchMap).success(function (date) {
            $scope.resultMap=date;
            buildPageLabel();
        })
    }

    $scope.addSearchItem=function (key , value) {
        if (key == 'category' || key =='brand' || key =='price' ) {
            $scope.searchMap[key] = value;
        }else {
            $scope.searchMap.spec[key] = value;
        }

        $scope.search();
    }

    $scope.removeSearchItem=function (key) {
        if (key == 'category' || key =='brand' || key =='price') {
            $scope.searchMap[key]='';
        }else {
          delete $scope.searchMap.spec[key];
        }

        $scope.search();
    }

    buildPageLabel=function () {
        $scope.pageLabel = [];

        var start = 1;
        var end =$scope.resultMap.totalPages;

        $scope.firstDot = true;
        $scope.lastDot = true;

        if ($scope.resultMap.totalPages >5){

            if ($scope.searchMap.pageNo <= 3){
                end = 5;
                $scope.firstDot = false;
            }else if ($scope.searchMap.pageNo >= $scope.resultMap.totalPages - 2){
                start = $scope.resultMap.totalPages - 4;
                $scope.lastDot = false;
            }else {
                start = $scope.searchMap.pageNo -2;
                end = $scope.searchMap.pageNo +2;
            }
            
        } else {
            $scope.firstDot = false;
            $scope.lastDot = false;
        }

        for (var i = start;i <= end;i++ ){
            $scope.pageLabel.push(i);
        }
    }
    
    $scope.queryByPage=function (pageNo) {
        if (pageNo < 1 || pageNo >  $scope.resultMap.totalPages) {
            return;
        }
        $scope.searchMap.pageNo = pageNo;
        $scope.search();
    }

    $scope.isTopPage=function () {
        if ( $scope.searchMap.pageNo == 1){
            return true;
        }
        return false;
    }

    $scope.isLastPage = function () {
        if ( $scope.searchMap.pageNo == $scope.resultMap.totalPages) {
            return true;
        }
        return false;
    }

    $scope.sortSearch=function (sortField ,sort ) {
        $scope.searchMap.sortField = sortField;
        $scope.searchMap.sort = sort;
        $scope.search();
    }

    $scope.keywordsIsBrand =function () {
        var brandList =  $scope.resultMap.brandList;
        for (var i = 0 ; i < brandList.length ; i++){
            if ($scope.searchMap.keywords.indexOf(brandList[i].text) >= 0 ){
                return false;
            }
        }
        return true;
    }

    $scope.loadkeywords=function () {
        $scope.searchMap.keywords = $location.search()["keywords"];
        $scope.search();
    }


})