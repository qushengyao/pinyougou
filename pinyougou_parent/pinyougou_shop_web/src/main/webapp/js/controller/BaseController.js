app.controller('baseController' ,function($scope){
	 $scope.reloadList=function(){
    	$scope.search( $scope.paginationConf.currentPage, $scope.paginationConf.itemsPerPage);
    }
	$scope.paginationConf = {
         currentPage: 1,
         totalItems: 10,
         itemsPerPage: 10,
         perPageOptions: [10, 20, 30, 40, 50],
         onChange: function(){
        	 $scope.reloadList();
     	 }
	};

    $scope.listId = [];
    //添加选中Id到数组
    $scope.addIdtoArray=function (id,$event) {

        if ($event.target.checked){
            $scope.listId.push(id);
        } else {
            var index = $scope.listId.indexOf(id);
            $scope.listId.splice(index,1);
        }
    }

    $scope.jsonToString=function (jsonString,key) {
        var json = JSON.parse(jsonString);
        var value = "";
        for (var i=0; i<json.length ; i++){
            if (i > 0){
                value += ",";
            }
            value += json[i][key];
        }
        return value;
    }

    $scope.searchObjectByKey=function (list,key,value) {

        for (var i = 0 ; i < list.length ; i++){

            if ( list[i][key] == value){
                return  list[i];
            }
        }
        return null;
    }


});	