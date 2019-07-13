package com.pinyougou.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.search.service.ItemSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service(timeout = 100000)
public class ItemSearchServiceImpl implements ItemSearchService {

    @Autowired
    private SolrTemplate solrTemplate;

    @Override
    public Map<String, Object> search(Map searchMap) {

        String keywords = (String) searchMap.get("keywords");
        searchMap.put("keywords",keywords.replace(" ",""));

        Map resultMap = new HashMap();

        //高亮集合
        resultMap.putAll(searchList(searchMap));

        //分类列表
        List<String> list = searchCategoryList(searchMap);
        resultMap.put("categoryList",list);

        String categoryName = (String) searchMap.get("category");
        if ("".equals(categoryName)){
            if (list.size()>0){
                resultMap.putAll(searchBrandAndSpecList(list.get(0)));
            }
        }else {
            resultMap.putAll(searchBrandAndSpecList(categoryName));
        }

        return resultMap;
    }

    //分类列表
    private List searchCategoryList(Map searchMap){
        List<String> list = new ArrayList<String>();

        Query query = new SimpleQuery("*:*");
        GroupOptions groupOptions = new GroupOptions();
        groupOptions.addGroupByField("item_category");
        query.setGroupOptions(groupOptions);

        //关键字查询
        Criteria criteria=new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);

        GroupResult<TbItem> groupResult = page.getGroupResult("item_category");
        Page<GroupEntry<TbItem>> entryList = groupResult.getGroupEntries();
        for (GroupEntry<TbItem> entry : entryList) {
            list.add(entry.getGroupValue());
        }
        return list;
    }

    //根据关键字查询并高亮
    private  Map searchList(Map searchMap){
        Map map = new HashMap();

        HighlightQuery query = new SimpleHighlightQuery();
        HighlightOptions highlightOptions = new HighlightOptions().addField("item_title");
        highlightOptions.setSimplePrefix("<span style='color:red'>");
        highlightOptions.setSimplePostfix("</span>");
        query.setHighlightOptions(highlightOptions);
        //关键字查询
        Criteria criteria=new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //分类查
        if (!"".equals(searchMap.get("category"))){
            Criteria filterCriteria = new Criteria("item_category").is(searchMap.get("category"));
            FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }

        //品牌查
        if (!"".equals(searchMap.get("brand"))){
            Criteria filterCriteria = new Criteria("item_brand").is(searchMap.get("brand"));
            FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }


        //规格查
        if (searchMap.get("spec")!= null){
           Map<String , String> specMap= (Map) searchMap.get("spec");
            for (String key : specMap.keySet()) {
                FilterQuery filterQuery = new SimpleFilterQuery();
                Criteria filterCriteria=new Criteria("item_spec_"+key).is( specMap.get(key)  );
                filterQuery .addCriteria(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }

        //价格区间
        if (!"".equals(searchMap.get("price"))){
           String[] price = ((String) searchMap.get("price")).split("-");
           if (!"0".equals(price[0])){
               Criteria filterCriteria = new Criteria("item_price").greaterThanEqual(price[0]);
               FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
               query.addFilterQuery(filterQuery);
           }
            if (!"*".equals(price[1])){
                Criteria filterCriteria = new Criteria("item_price").lessThanEqual(price[1]);
                FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }

        }

        Integer  pageNo = (Integer) searchMap.get("pageNo");
        if (pageNo == null){
            pageNo = 1;
        }

        Integer pageSize = (Integer) searchMap.get("pageSize");
        if (pageSize == null){
            pageSize = 30;
        }

        query.setOffset((pageNo -1) * pageSize);
        query.setRows(pageSize);

        String sortField = (String) searchMap.get("sortField");
        String sortValue = (String) searchMap.get("sort");
        if (sortValue!=null && !"".equals(sortValue)){
            if ("ASC".equals(sortValue)){
                Sort sort = new Sort(Sort.Direction.ASC , "item_" + sortField);
                query.addSort(sort);
            }

            if ("DESC".equals(sortValue)){
                Sort sort = new Sort(Sort.Direction.DESC , "item_"+sortField);
                query.addSort(sort);
            }
        }



        HighlightPage<TbItem> page = solrTemplate.queryForHighlightPage(query, TbItem.class);

        List<HighlightEntry<TbItem>> itemsHighlighted = page.getHighlighted();

        for (HighlightEntry<TbItem> entry : itemsHighlighted) {


            List<HighlightEntry.Highlight> highlightList = entry.getHighlights();

            if (highlightList.size() > 0 && highlightList.get(0).getSnipplets().size() > 0){
                TbItem tbItem = entry.getEntity();
                String s = highlightList.get(0).getSnipplets().get(0);
                tbItem.setTitle(s);
            }

        }
        map.put("rows",page.getContent());
        map.put("totalPages",page.getTotalPages());
        map.put("total",page.getTotalElements());
        return map;
    }
    @Autowired
    private RedisTemplate redisTemplate;

    public Map searchBrandAndSpecList(String category){
        Map map = new HashMap();


        Long typeIds = (Long) redisTemplate.boundHashOps("itemCat").get(category);
        if (typeIds != null){
            List brandList = (List) redisTemplate.boundHashOps("brandList").get(typeIds);
            map.put("brandList",brandList);

            List specList = (List) redisTemplate.boundHashOps("specList").get(typeIds);
            map.put("specList",specList);
        }

        return map;
    }

    @Override
    public void importList(List list) {
        solrTemplate.saveBeans(list);
        solrTemplate.commit();
    }

    @Override
    public void deleteByGoodsIds(List goodsIds) {
        Query query = new SimpleFacetQuery();
        Criteria criteria = new Criteria("item_goodsid").in(goodsIds);
        query.addCriteria(criteria);
        solrTemplate.delete(query);
        solrTemplate.commit();
    }


}
