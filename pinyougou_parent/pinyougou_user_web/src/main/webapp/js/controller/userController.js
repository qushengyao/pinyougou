 //控制层 
app.controller('userController' ,function($scope ,userService){
	
	$scope.reg = function () {
		if ($scope.password!=$scope.entity.password) {
            alert("两次输入密码不一致，请重新输入");
            $scope.entity.password="";
            $scope.password="";
		}
		userService.add($scope.entity,$scope.smscode).success(function (response) {
			alert(response.message);
        })
    }

    $scope.sendCode = function () {
        // var reg_telephone =
        //     new RegExp("^(13[09]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\\d{8}$");

        if ($scope.entity.phone == null || $scope.entity.phone == ""){
        	alert("请输入手机号码");
        	return ;
		}
		// if (reg_telephone .test($scope.entity.phone)) {
		// 	alert("您输入的手机号不符合规范,请重新输入")
		// 	return ;
		// }

		userService.sendCode($scope.entity.phone ).success(function (response) {
			alert(response.message);
        })

    }
	

});	
