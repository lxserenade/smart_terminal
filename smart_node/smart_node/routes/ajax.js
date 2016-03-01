/*
 * ajax
 */
var express = require('express');
var router = express.Router();
var mongoose = require('./mongoose.js');
var models = require('./models');
var terminals = models.terminals;


router.get('/raw', function(req, res, next) {
  
  //查询所有数据
	terminals.find(function(err,docs){
		if(err) {
			console.log(err);
			return;
		}
		res.send(docs);

	});
});

router.get('/categories/', function(req, res, next) {
  //  统计 所有业务 返回业务名称list
    terminals.find(['category']).distinct('category',function(err,docs){
		if(err) {
			res.send({'error':err})
			}
		else{
			res.send({'categories':docs});
		}
	});
});

router.get('/locations/', function(req, res, next) {
  //  统计 所有位置 返回位置名称list
    terminals.find(['terminal_name']).distinct('terminal_name',function(err,docs){
		if(err) {
			res.send({'error':err})
			}
		else{
			res.send({'locations':docs});
		}
	});
});


router.get('/click_statistic/', function(req, res, next) {
  //点击量相关统计
  //按业务、终端名过滤 获取每天的点击量,返回list，业务+终端名+日期 作为唯一索引
  //query para: category,terminal_name,sortby  
  //query示例： /click_statistic?category=文字_next&terminal_name=东下院&sortby=click-
  //      			click为升序  click-为降序
  //排序提供两种方式：点击量或日期
  //                 sortby: click/date
    match = {}
    _id = {}
    _id.date = "$date"
    if(typeof req.query.terminal_name !== 'undefined'  &&  req.query.terminal_name !== ''){
    	match.terminal_name = req.query.terminal_name;
    	_id.terminal_name = "$terminal_name"
    }

    if(typeof req.query.category !== 'undefined' &&  req.query.category !== ''){
    	match.category = req.query.category;
    	_id.category = "$category"
    }


    if(typeof req.query.sortby !== 'undefined'  ){
			seq = req.query.sortby.split('-').length>1?-1:1;
		    sortby = req.query.sortby.split('-')[0];  	
		    sort = {};
		    sort[sortby]=seq;	
	    }else{
	    	sort = {};
		    sort['click']=-1;
    }

	terminals.aggregate([		  
			  {"$match": match},
			  {"$group": { "_id": _id,
			  				"date":{"$first":"$date"},
			  				"click": {"$sum":"$click"}
			  			 }
			 	 },
		 	  {"$sort":sort}
			],function(err,docs){
					if(err) {
						res.send({'error':err})
						}

					res.send(docs);

	});
});

router.get('/get_list/', function(req, res, next) {
  	per_page = 1000
    page = (typeof req.query.page !== 'undefined')?req.query.page:1;
    var pageNum;
	terminals.count({}, function(err, c)
	  {  	  
	  		pageNum = Math.floor(c/per_page)!==c/per_page? Math.floor(c/per_page)+1:Math.floor(c/per_page);
		  });

	terminals.find().sort({date:1}).skip(per_page*(page-1)).limit(per_page).exec('find', function(err, items) {

			res.send({'pageNum':pageNum,
						'data':items})
		});



});



router.get('/category_statistic/', function(req, res, next) {
  //点击量相关统计
  //按日期、终端名过滤 获取每种业务的点击量,返回list，业务+终端名+日期 作为唯一索引
  //query para: date,terminal_name,sortby  
  //query示例： /category_statistic/?terminal_name=东下院&date=2015-1-1&sortby=click-
  //      			click为升序  click-为降序
  //排序: click

    match = {}
    _id = {}
    _id.category = "$category"
    if(typeof req.query.terminal_name !== 'undefined'  &&  req.query.terminal_name !== ''){
    	match.terminal_name = req.query.terminal_name;
    	_id.terminal_name = "$terminal_name"
    }

    if(typeof req.query.date !== 'undefined' &&  req.query.date !== ''){
		match.date = new Date(req.query.date+'T00:00:00.000Z');
    	_id.date = "$date"
    }


    if(typeof req.query.sortby !== 'undefined'  ){
			seq = req.query.sortby.split('-').length>1?-1:1;
		    sortby = req.query.sortby.split('-')[0];  	
		    sort = {};
		    sort[sortby]=seq;	
	    }else{
	    	sort = {};
		    sort['click']=-1;
    }

  	terminals.aggregate([		  
			  {"$match": match},
			  {"$group": { "_id": _id,
			  				"category":{"$first":"$category"},
			  				"date":{"$first":"$date"},
			  				"click": {"$sum":"$click"}
			  			 }
			 	 },
		 	  {"$sort":sort}
			],function(err,docs){
					if(err) {
						res.send({'error':err})
						}

					res.send(docs);

	});
});


router.get('/most_popular_terminal/', function(req, res, next) {
	//统计终端点击量，按点击量排序
	//返回终端列表
	terminals.aggregate([
			  {"$group": { "_id":{'terminal_id':'$terminal_id'},
			  				"terminal_name":{"$first":"$terminal_name"},
			  				"click": {"$sum":"$click"}
			  			 }
			 	 },
		 	  {"$sort":{'click':-1}}
			],function(err,docs){
					if(err) {
						res.send({'error':err})
						}

					res.send(docs);

	});

});


router.get('/category_average/', function(req, res, next) {
	//统计业务每日平均点击量
	//返回
	if(typeof req.query.startDate !== 'undefined' && typeof req.query.endDate !== 'undefined'){
			startDate = new Date(req.query.startDate)
			endDate = new Date(req.query.endDate)
	}

	var category_sum = []
	var category_average = [];
	

	terminals.aggregate([
			  {"$match": {"category":{$regex:"^[^/]*$"}}},
			  {"$group": { "_id":{'category':'$category','date':'$date'},  
			 					  'count':{'$sum':1}, 
				  				  "all": {"$sum":"$click"}     //每个业务总点击量
			  			 }
			 	 },
		 	  {"$group": { "_id":'$_id.category',
		 	  				'date':{'$push':'$_id.date'},
		 	 				'count':{'$push':'$count'},
			  			    'avg':{'$avg':'$all'}
			  			 }
			 	 },
		 	  {"$sort":{'avg':-1}},
		 	 {"$limit":30}
			],function(err,docs){
					if(err) {
						res.send({'error':err})
						}else{
							// docs.forEach(function(d){ d.click=d.click/d.count;});
							console.log(docs);
							 res.send(docs);
						}
	});

	terminals.aggregate([
			  {"$match": {"category":{$regex:"^[^/]*$"}}},
			  {"$group": { "_id":{'category':'$category'},   
				  				   "click": {"$sum":"$click"}     //每个业务记录天数
			  			 }
			 	 },
		 	  {"$sort":{'click':-1}},
		 	 {"$limit":30}
			],function(err,docs){
					if(err) {
						res.send({'error':err})
						}else{
							// docs.forEach(function(d){ d.click=d.click/d.count;});
							category_sum =docs;
							// res.send(docs);
						}
	});

});


router.post('/compound_query/', function(req, res, next) {
	//根据查询条件,返回查询结果
	// query para: date1 - date2，selected_cat (list) selected_loc (list), cat_average (bool), loc_average (bool)
	//注：  按日平均，并不是在选择的日期区间内平均每日点击量，因为原始数据并不是每天都有，如在某100天区间内仅有一天的数据 （100点击量），
	//      那么按日平均值应为 100 （总点击量 100 /  记录天数 1 ＝ 100）
	//
	 query_para = req.body
	 cat_list = []
	 loc_list = []
	startDate = new Date(query_para.startDate+'T00:00:00.000Z');
	endDate = new Date(query_para.endDate+'T00:00:00.000Z');

	if(typeof query_para['selected_cat[list][]'] === "string"){
		cat_list.push(query_para['selected_cat[list][]'])
	}else{
		cat_list = query_para['selected_cat[list][]'];
	}

	if(typeof query_para['selected_loc[list][]'] === "string"){
		loc_list.push(query_para['selected_loc[list][]'])
	}else{
		loc_list = query_para['selected_loc[list][]']
	}


	if(query_para['date_average_enable'] === 'true'){  //按日平均
		
	
		if(query_para['loc_average_enable'] === 'true'){  //按日平均且按终端平均, 即平均每个终端每个业务每日的平均点击量

				terminals.aggregate([
					 {"$match": {"category":{$in:cat_list},
					 			 "terminal_name":{$in:loc_list},
				 			     "date":{$gte: startDate,$lte: endDate}
					 			}
			 			},
					 {"$group": { "_id":{'category':'$category'},   //平均每个终端每天业务平均点击量
				  				   "click": {"$avg":"$click"}
					  			 }
					 	 },
				 	  {"$sort":{'click':-1}},
					],function(err,docs){
							data = [];
							if(err) {
								res.send({'error':err})
								}else{
									docs.forEach(function(d){
										tmp = {}
										tmp.category = d._id.category;
										tmp.click = d.click;
										data.push(tmp)
								});
									res.send(data);
								}
						});
			}else{ //按日平均但不区分终端，即所有终端各个业务平均每日点击量总和
					terminals.aggregate([
					 {"$match": {"category":{$in:cat_list},
					 			 "terminal_name":{$in:loc_list},
				 			     "date":{$gte: startDate,$lte: endDate}
					 			}
			 			},
					  {"$group": { "_id":{'category':'$category','date':'$date'},  
				 					  'count':{'$sum':1}, 
					  				  "all": {"$sum":"$click"}     //每个业务每天总点击量
				  			 }
				 	 },
				 	  {"$group": { "_id":'$_id.category',
					  			    'click':{'$avg':'$all'}
					  			 }
					 	 },
				 	  {"$sort":{'click':-1}},
					],function(err,docs){
							data = [];
							if(err) {
								res.send({'error':err})
								}else{
									docs.forEach(function(d){
										tmp = {}
										tmp.category = d._id;
										tmp.click = d.click;
										data.push(tmp)
								});
									res.send(data);
								}
						});

			}
	}else{  
		if(query_para['loc_average_enable'] === 'true'){  //按终端平均 不区分日期， 即平均每个终端相应业务的点击量

		
				terminals.aggregate([
						{"$match": {"category":{$in:cat_list},
					 			    "terminal_name":{$in:loc_list},
					 			    "date":{$gte: startDate,$lte: endDate}
					 			}
			 			},
						 {"$group": { "_id":{'category':'$category'},
						  				"click": {"$sum":"$click"}    //返回点击量总和，除以终端数得到平均每个终端的点击量
						  			 }
						 	 },
					 	  {"$sort":{'click':-1}},
						],function(err,docs){
								data = [];
								if(err) {
									res.send({'error':err})
									}else{
										docs.forEach(function(d){
											tmp = {}
											tmp.category = d._id.category;
											tmp.click = d.click/loc_list.length;
											data.push(tmp)
									});
										res.send(data);
									}
							});
		}else{   //不区分终端，不区分日期  即统计相同业务 总点击量，
				terminals.aggregate([
						{"$match": {"category":{$in:cat_list},
					 			    "terminal_name":{$in:loc_list},
					 			    "date":{$gte: startDate,$lte: endDate}
					 			}
			 			},
						 {"$group": { "_id":{'category':'$category'},
						  				"click": {"$sum":"$click"}   
						  			 }
						 	 },
					 	  {"$sort":{'click':-1}},
						],function(err,docs){
								data = [];
								if(err) {
									res.send({'error':err})
									}else{
										docs.forEach(function(d){
											tmp = {}
											tmp.category = d._id.category;
											tmp.click = d.click;   
											data.push(tmp)
									});
										res.send(data);
									}
							});
		}
	}
	
});



module.exports = router;
