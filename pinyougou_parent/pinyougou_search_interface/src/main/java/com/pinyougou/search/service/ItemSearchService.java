package com.pinyougou.search.service;

import java.util.List;
import java.util.Map;

public interface ItemSearchService {

    Map<String,Object> search(Map searchMap);

    void importList(List list);

    void deleteByGoodsIds(List goodsIds);
}
