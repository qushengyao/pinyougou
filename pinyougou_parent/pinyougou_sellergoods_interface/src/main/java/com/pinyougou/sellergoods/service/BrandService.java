package com.pinyougou.sellergoods.service;

import com.pinyougou.pojo.TbBrand;
import entity.PageResult;

import java.util.List;
import java.util.Map;

public interface BrandService {
    List<TbBrand> findAll();

    PageResult findAndPages(Integer pageNum,Integer pageSize);

     void save(TbBrand tbBrand);

     void update(TbBrand tbBrand);

     TbBrand findOne(Long id);

     void dele(Long[] ids);

    PageResult findByManyAndPages(TbBrand tbBrand,Integer pageNum,Integer pageSize);

    List<Map>  selectOptionList();
}
