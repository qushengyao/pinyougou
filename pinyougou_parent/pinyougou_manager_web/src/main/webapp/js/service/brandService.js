app.service("brandService",function ($http) {
    this.findAll=function () {
        return $http.get("../brand/findAll.do");
    }

    this.save=function (entity) {
        return $http.post('../brand/save.do',entity);
    }

    this.updat = function (entity) {
        return $http.post('../brand/update.do',entity);
    }

    this.findOne = function (id) {
        return $http.get('../brand/findOne.do?id='+id)
    }

    this.dele = function (lists) {
        return $http.get('../brand/dele.do?ids='+lists);
    }

    this.findAllByMany = function (page,size,selectMany) {
        return $http.post('../brand/findByManyAndPages.do?pageNum='+page +'&size='+size , selectMany)
    }

    this.selectListByBrand=function () {
        return $http.get("../brand/selectOptionList.do");

    }
})