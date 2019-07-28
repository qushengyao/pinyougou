//购物车控制层
app.controller('cartController',function($scope,cartService){
	//查询购物车列表
	$scope.findCartList=function(){
		cartService.findCartList().success(
			function(response){
				$scope.cartList=response;
				$scope.totalValue= cartService.sum($scope.cartList);
			}
		);
	}
	
	//数量加减
	$scope.addGoodsToCartList=function(itemId,num){
		cartService.addGoodsToCartList(itemId,num).success(
			function(response){
				if(response.success){//如果成功
					$scope.findCartList();//刷新列表
				}else{
					alert(response.message);
				}				
			}		
		);		
	}

	$scope.findListByLoginUser = function () {
		cartService.findListByLoginUser().success(
			function (response) {
				$scope.addressList = response;
				for (var i = 0; i <$scope.addressList .length ; i++ ) {
					if ($scope.addressList[i].isDefault =='1'){
                        $scope.address = $scope.addressList[i];
                        break;
					}
				}
            }
		)
    }

    $scope.selectAddress = function (address) {
		$scope.address = address;
    }

    $scope.isSelectedAddress = function (address) {
		if ($scope.address == address){
			return true;
		} else {
			return false;
		}
    }

    $scope.order={paymentType:'1'};
    //选择支付方式
    $scope.selectPayType=function(type){
        $scope.order.paymentType= type;
    }

    $scope.submitOrder=function () {
        $scope.order.receiverAreaName=$scope.address.address;
        $scope.order.receiverMobile = $scope.address.mobile;
        $scope.order.receiver = $scope.address.contact;
        cartService.submitOrder($scope.order).success(
        	function (response) {
                if(response.success){
                    //页面跳转
                    if($scope.order.paymentType=='1'){//如果是微信支付，跳转到支付页面
                        location.href="pay.html";
                    }else{//如果货到付款，跳转到提示页面
                        location.href="paysuccess.html";
                    }
                }else{
                    alert(response.message);	//也可以跳转到提示页面
                }
            }
		)
    }

	
});