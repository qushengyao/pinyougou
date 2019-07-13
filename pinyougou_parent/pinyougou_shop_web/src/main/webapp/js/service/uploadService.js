app.service('uploadService',function($http){

    this.uploadFile=function(){
        var formdata=new FormData();		  //创建form表单
        formdata.append('file',file.files[0]);//绑定表单参数

        return $http({
            url:'../upload.do',						//提交的路径
            method:'post',							//提交方式
            data:formdata,							//表单数据
            headers:{ 'Content-Type':undefined },	//设置Content-Type="multipart/form-data"
            transformRequest: angular.identity		//序列化表单数据
        });
    }
});


