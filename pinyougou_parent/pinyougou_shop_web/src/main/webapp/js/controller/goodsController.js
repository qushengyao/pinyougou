 //控制层 
app.controller('goodsController' ,function($scope,$controller,goodsService,uploadService,itemCatService,typeTemplateService,$location){

	$controller('baseController',{$scope:$scope});//继承

    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}
		);
	}

	//分页
	$scope.findPage=function(page,rows){
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}
		);
	}

	//查询实体
	$scope.findOne=function(id){
		var id = $location.search()['id'];
		if (id == null){
			return ;
		}

		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;
                editor.html($scope.entity.goodsDesc.introduction);
                $scope.entity.goodsDesc.itemImages = JSON.parse($scope.entity.goodsDesc.itemImages);
                $scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.entity.goodsDesc.customAttributeItems);
                $scope.entity.goodsDesc.specificationItems=JSON.parse($scope.entity.goodsDesc.specificationItems);

                for (var i = 0;$scope.entity.itemList.length;i++){
                    $scope.entity.itemList[i].spec=JSON.parse($scope.entity.itemList[i].spec);
				}
			}
		);
	}

	$scope.checkAttributeValue= function(specName,optionName){
		var items = $scope.entity.goodsDesc.specificationItems;
        var obj = $scope.searchObjectByKey(items,'attributeName',specName);
        if (obj == null){
				return false;
		}else {
        	if (obj.attributeValue.indexOf(optionName) >= 0){
        		return true;
			} else {
        		return false;
			}
		}
	}

	//保存
	$scope.save=function(){
        $scope.entity.goodsDesc.introduction=editor.html();
		var serviceObject;//服务层对象
		if($scope.entity.goods.id!=null){//如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改
		}else{
			serviceObject=goodsService.add( $scope.entity  );//增加
		}
		serviceObject.success(
			function(response){
				if(response.success){
                    alert(response.message);
                    // $scope.entity={goodsDesc:{itemImages:[],customAttributeItems:[],specificationItems:[]}};
                    // editor.html("");//清空富文本编辑器
                    location.href="goods.html";//跳转到商品列表页
				}else{
					alert(response.message);
				}
			}
		);
	}
	//
    // //增加商品
    // $scope.add=function(){
    //     $scope.entity.goodsDesc.introduction=editor.html();
	//
    //     goodsService.add( $scope.entity  ).success(
    //         function(response){
    //             if(response.success){
    //                 alert(response.message);
    //                 $scope.entity={goodsDesc:{itemImages:[],customAttributeItems:[],specificationItems:[]}};
    //                 editor.html("");//清空富文本编辑器
    //             }else{
    //                 alert(response.message);
    //             }
    //         }
    //     );
    // }




	//批量删除
	$scope.dele=function(){
		//获取选中的复选框
		goodsService.dele(  $scope.listId).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}
			}
		);
	}

	$scope.searchEntity={};//定义搜索对象


	$scope.auditStatusList=["未审核","审核通过","以驳回"];

	$scope.itemCatIdNameList=[];




	$scope.findItemCat=function(){
		itemCatService.findAll().success(function (response) {
			var itemCatList = response;
			for (var i = 0;i < itemCatList.length ;i++){
                $scope.itemCatIdNameList[itemCatList[i].id] = itemCatList[i].name;
			}
        })
	}

	//搜索
	$scope.search=function(page,rows){
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}
		);
	}
    $scope.entity={goodsDesc:{itemImages:[],customAttributeItems:[],specificationItems:[]}};
    $scope.uploadFile=function(){
        uploadService.uploadFile().success(
            function(response){
                if(response.success){
                    $scope.image_entity.url= response.message;
                }else{
                    alert(response.message);
                }
            }
        );
    }



    $scope.add_image_entity=function () {
        $scope.entity.goodsDesc.itemImages.push($scope.image_entity)
    }

    $scope.remove_image_entity=function (index) {
        $scope.entity.goodsDesc.itemImages.splice(index,1);
    }

    $scope.selectItemCat1List=function () {
        itemCatService.findByParentId(0).success(function (response) {
            $scope.category1IdList =response;
        })
    }

    $scope.$watch("entity.goods.category1Id",function (newValue,oldValue) {
        $scope.category3IdList=[];
        itemCatService.findByParentId(newValue).success(function (response) {
            $scope.category2IdList =response;
     })
    });

    $scope.$watch("entity.goods.category2Id",function (newValue,oldValue) {
        itemCatService.findByParentId(newValue).success(function (response) {
            $scope.category3IdList =response;
        })
    });


    $scope.$watch("entity.goods.category3Id",function (newValue,oldValue) {
        itemCatService.findOne(newValue).success(function (response) {

                $scope.entity.goods.typeTemplateId= response.typeId;

        })
    });

    $scope.$watch("entity.goods.typeTemplateId",function (newValue,oldValue) {
        typeTemplateService.findOne(newValue).success(function (response) {

            $scope.brandIds = JSON.parse(response.brandIds);
            if ($location.search()['id'] = null){
                $scope.entity.goodsDesc.customAttributeItems =JSON.parse(response.customAttributeItems);
			}

        })


            typeTemplateService.findSpecList(newValue).success(function (response) {
                $scope.specList = response;
            })

    });

    // 1. 定义规格数组
    // 2. 勾选规格的checkbox框时,传递当前规格名称和对应选项
	$scope.updateSpecAttribute=function ($event,name,value) {
        // 3. 在规格数组中判断当前规格是否存在
		var  obj = $scope.searchObjectByKey(
			$scope.entity.goodsDesc.specificationItems,"attributeName",name
		)
        // 3.1 不存在:封装当前规格名称和选项,并添加到规格数组中
		if (obj == null){
            $scope.entity.goodsDesc.specificationItems.push( {"attributeName":name,"attributeValue":[value]});
            // 3.2 存在
		}else {
            // 3.2.1 判断当前checkbox状态
			if ($event.target.checked){
                // 3.2.1.1 选中:将规格选项添加到当前规格的选项数组中
                obj.attributeValue.push(value);
			}else {
                // 3.2.1.2 取消选中:将规格选项从当前规格的选项数组中移除
				obj.attributeValue.splice(obj.attributeValue.indexOf(value),1)
                // 判断如果所有的规格选项均被移除,则删除当前规格对象
				if (obj.attributeValue.length == 0){
                    $scope.entity.goodsDesc.specificationItems.splice($scope.entity.goodsDesc.specificationItems.indexOf(obj),1)
				}
			}
		}

    }

    $scope.createItemList=function () {
        $scope.entity.itemList =[{spec:{},price:0,num:9999,status:'0',isDefault:'0'}];
        var items = $scope.entity.goodsDesc.specificationItems;
        for (var i = 0 ; i<items.length ;i++){
        	var itemName = items[i].attributeName;
            var itemValeList = items[i].attributeValue;
            var list = [];
			for (var j = 0 ; j<$scope.entity.itemList.length;j++ ){
                var old = $scope.entity.itemList[j];
                for (var k = 0; k<itemValeList.length ; k++ ){
                	var newitem = JSON.parse(JSON.stringify(old));
                	newitem.spec[itemName] = itemValeList[k];
                	list.push(newitem);
				}
			}
            $scope.entity.itemList =list;
		}
    }









});
