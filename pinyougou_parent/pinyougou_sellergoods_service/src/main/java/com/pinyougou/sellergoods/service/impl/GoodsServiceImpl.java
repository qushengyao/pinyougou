package com.pinyougou.sellergoods.service.impl;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.pinyougou.mapper.*;
import com.pinyougou.pojo.*;
import com.pinyougou.pojogroup.Goods;
import com.pinyougou.sellergoods.service.GoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import com.alibaba.dubbo.config.annotation.Service;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.pinyougou.pojo.TbGoodsExample.Criteria;


import entity.PageResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * 服务实现层
 * @author Administrator
 *
 */
@Service(timeout = 100000)
@Transactional
public class GoodsServiceImpl implements GoodsService {

	@Autowired
	private TbGoodsMapper goodsMapper;

	@Autowired
	private TbGoodsDescMapper goodsDescMapper;

	@Autowired
	private TbItemMapper itemMapper;

	@Autowired
	private TbItemCatMapper itemCatMapper;

	@Autowired
	private TbSellerMapper tbSellerMapper;

	@Autowired
	private TbBrandMapper brandMapper;

	/**
	 * 查询全部
	 */
	@Override
	public List<TbGoods> findAll() {
		return goodsMapper.selectByExample(null);
	}

	/**
	 * 按分页查询
	 */
	@Override
	public PageResult findPage(int pageNum, int pageSize) {
		PageHelper.startPage(pageNum, pageSize);		
		Page<TbGoods> page=   (Page<TbGoods>) goodsMapper.selectByExample(null);
		return new PageResult(page.getTotal(), page.getResult());
	}

	/**
	 * 增加
	 */
	@Override
	public void add(Goods goods) {

		goods.getGoods().setAuditStatus("0");
		goodsMapper.insert(goods.getGoods());

		goods.getGoodsDesc().setGoodsId(goods.getGoods().getId());
		goodsDescMapper.insert(goods.getGoodsDesc());

		addItemList(goods);
	}

	private void addItemList(Goods goods){
		if ("1".equals(goods.getGoods().getIsEnableSpec())){
			for (TbItem item : goods.getItemList()) {
//			//商品标题
				String title = goods.getGoods().getGoodsName();
				Map<String,Object> map = JSON.parseObject(item.getSpec());
				for (String s : map.keySet()) {
					title += " " + map.get(s);
				}
				item.setTitle(title);

				setItemValues(item,goods);
				itemMapper.insert(item);
			}
		}else {
			TbItem item = new TbItem();
			item.setTitle(goods.getGoods().getGoodsName());
			item.setPrice(goods.getGoods().getPrice());
			item.setStatus("1");
			item.setIsDefault("1");
			item.setSpec("{}");
			item.setNum(99999);
			setItemValues(item,goods);
			itemMapper.insert(item);
		}
	}

	private void setItemValues(TbItem item,Goods goods){
		//image
		String images = goods.getGoodsDesc().getItemImages();
		List<Map> maps = JSON.parseArray(images, Map.class);
		if (maps.size() > 0){
			item.setImage((String) maps.get(0).get("url"));
		}
		//所属类目，叶子类目
		item.setCategoryid(goods.getGoods().getCategory3Id());
//
//			//创建时间
		item.setCreateTime(new Date());
//
//			//更新时间
		item.setUpdateTime(new Date());
//
//			//所属SPU
		item.setGoodsId(goods.getGoods().getId());
//
//			//商家ID
		item.setSellerId(goods.getGoods().getSellerId());
//
//			//品牌
		TbBrand brand = brandMapper.selectByPrimaryKey(goods.getGoods().getBrandId());
		item.setBrand(brand.getName());
//
//			//分类
		TbItemCat itemCat = itemCatMapper.selectByPrimaryKey(goods.getGoods().getCategory3Id());
		item.setCategory(itemCat.getName());
//
//			//所属商家
		TbSeller seller = tbSellerMapper.selectByPrimaryKey(goods.getGoods().getSellerId());
		item.setSeller(seller.getNickName());
	}

	
	/**
	 * 修改
	 */
	@Override
	public void update(Goods goods){
		goods.getGoods().setAuditStatus("0");

		goodsMapper.updateByPrimaryKey(goods.getGoods());
		goodsDescMapper.updateByPrimaryKey(goods.getGoodsDesc());

		TbItemExample example = new TbItemExample();
		TbItemExample.Criteria criteria = example.createCriteria();
		criteria.andGoodsIdEqualTo(goods.getGoods().getId());
		itemMapper.deleteByExample(example);

		addItemList(goods);
	}	
	
	/**
	 * 根据ID获取实体
	 * @param id
	 * @return
	 */
	@Override
	public Goods findOne(Long id){
		Goods good = new Goods();
		TbGoods goods = goodsMapper.selectByPrimaryKey(id);
		good.setGoods(goods);

		TbGoodsDesc goodsDesc = goodsDescMapper.selectByPrimaryKey(id);
		good.setGoodsDesc(goodsDesc);

		TbItemExample example = new TbItemExample();
		TbItemExample.Criteria criteria = example.createCriteria();
		criteria.andGoodsIdEqualTo(id);
		List<TbItem> itemList = itemMapper.selectByExample(example);
		good.setItemList(itemList);
		return good;
	}

	/**
	 * 批量删除
	 */
	@Override
	public void delete(Long[] ids) {
		for(Long id:ids){
//			goodsMapper.deleteByPrimaryKey(id);
////			goodsDescMapper.deleteByPrimaryKey(id);
////			TbItemExample example = new TbItemExample();
////			TbItemExample.Criteria criteria = example.createCriteria();
////			criteria.andGoodsIdEqualTo(id);
////			itemMapper.deleteByExample(example);
			TbGoods tbGoods = goodsMapper.selectByPrimaryKey(id);
			tbGoods.setIsDelete("1");
			goodsMapper.updateByPrimaryKey(tbGoods);
		}		
	}
	
	
		@Override
	public PageResult findPage(TbGoods goods, int pageNum, int pageSize) {
		PageHelper.startPage(pageNum, pageSize);
		
		TbGoodsExample example=new TbGoodsExample();
		Criteria criteria = example.createCriteria();
		criteria.andIsDeleteIsNull();
		
		if(goods!=null){			
						if(goods.getSellerId()!=null && goods.getSellerId().length()>0){
				criteria.andSellerIdEqualTo(goods.getSellerId());
			}
			if(goods.getGoodsName()!=null && goods.getGoodsName().length()>0){
				criteria.andGoodsNameLike("%"+goods.getGoodsName()+"%");
			}
			if(goods.getAuditStatus()!=null && goods.getAuditStatus().length()>0){
				criteria.andAuditStatusLike("%"+goods.getAuditStatus()+"%");
			}
			if(goods.getIsMarketable()!=null && goods.getIsMarketable().length()>0){
				criteria.andIsMarketableLike("%"+goods.getIsMarketable()+"%");
			}
			if(goods.getCaption()!=null && goods.getCaption().length()>0){
				criteria.andCaptionLike("%"+goods.getCaption()+"%");
			}
			if(goods.getSmallPic()!=null && goods.getSmallPic().length()>0){
				criteria.andSmallPicLike("%"+goods.getSmallPic()+"%");
			}
			if(goods.getIsEnableSpec()!=null && goods.getIsEnableSpec().length()>0){
				criteria.andIsEnableSpecLike("%"+goods.getIsEnableSpec()+"%");
			}
			if(goods.getIsDelete()!=null && goods.getIsDelete().length()>0){
				criteria.andIsDeleteLike("%"+goods.getIsDelete()+"%");
			}
	
		}
		
		Page<TbGoods> page= (Page<TbGoods>)goodsMapper.selectByExample(example);		
		return new PageResult(page.getTotal(), page.getResult());
	}

	@Override
	public void updateStatus(Long[] ids ,String status) {
		for (Long id : ids) {
			TbGoods tbGoods = goodsMapper.selectByPrimaryKey(id);
			tbGoods.setAuditStatus(status);
			goodsMapper.updateByPrimaryKey(tbGoods);
		}
	}

	@Override
	public List<TbItem> findItemListByGoodsIdListAndStatus(Long[] ids, String status) {

		TbItemExample example = new TbItemExample();
		TbItemExample.Criteria criteria = example.createCriteria();
		criteria.andStatusEqualTo(status);
		criteria.andGoodsIdIn(Arrays.asList(ids));
		return itemMapper.selectByExample(example);

	}


}
