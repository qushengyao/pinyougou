 //控制层 
app.controller('itemController' ,function($scope ){

	$scope.addNum = function (x) {

		$scope.num += x;
		if ($scope.num < 1){
			$scope.num = 1;
		}

    }

    $scope.specificationItems={};
	
	$scope.addSpec=function (key,value) {
        $scope.specificationItems[key] = value;
        searchSku();
    }

    $scope.isSelected=function (key,value) {
		if ($scope.specificationItems[key] == value){
			return true
		}
		return false;
    }

    $scope.loadSku=function () {
		$scope.sku = skuList[0];
		$scope.specificationItems  =  JSON.parse(JSON.stringify(skuList[0].spec));
    }

    matchObject=function (map1 , map2) {
		for (var k in map1){
			if (map1[k] != map2[k]){
				return false;
			}
		}

        for (var k in map2){
            if (map2[k] != map1[k]){
                return false;
            }
        }

        return true;
    }

    searchSku = function () {
		for (var i = 0 ; i <skuList.length ; i++ ){
			if (matchObject(skuList[i].spec , $scope.specificationItems)){

				$scope.sku = skuList[i];
				return ;
			}
		}
        $scope.sku = { id:"",title: "-------" ,price: 0}
    }

//添加商品到购物车
    $scope.addToCart=function(){
        //alert('SKUID:'+$scope.sku.id );

        $http.get('http://localhost:9107/cart/addGoodsToCartList.do?itemId='
            +$scope.sku.id+'&num='+$scope.num ,{'withCredentials':true} ).success(
            function(response){
                if(response.success){
                    location.href='http://localhost:9107/cart.html';
                }else{
                    alert(response.message);
                }
            }
        );

    }





});
