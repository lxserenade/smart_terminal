/*
 * GET home page.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('./mongoose.js');
var models = require('./models');
var terminals = models.terminals;

router.get('/', authentication);
router.get('/service', authentication);
router.get('/list', authentication);
router.get('/category_average', authentication);
router.get('/query', authentication);



function authentication(req, res, next) {
  console.log(req.session.user_id)
    if (req.session.user_id !== 'smart') {
      console.log("auth")
      req.session.error='请先登陆';
      return res.redirect('/login');
    }
    next();
}

/* GET home page. */
router.get('/', function(req, res, next) { 

 res.render('index',{title:'terminals',page_name:'index'})
});

/* GET login page. */
router.get('/login', function(req, res, next) { 

 	res.render('login')
});

/* POST login page. */
router.post('/login', function(req, res, next) { 
	var userid = req.body.username;
    var pwd = req.body.password;
    console.log(userid)
 	if(userid === "smart" && pwd==="smart"){
 		req.session.user_id = userid;

 		res.redirect('/');
 	}
 	res.redirect('login')
});

/* GET compound query page. */
router.get('/query', function(req, res, next) { 
  res.render('query',{title:'复合查询',page_name:'query'})
});


/* GET service page. */
router.get('/service', function(req, res, next) { 
  res.render('service',{title:'按业务统计',page_name:'service'})
});

/* GET terminal page. */
router.get('/terminal', function(req, res, next) { 
  res.render('terminal',{title:'按终端统计',page_name:'terminal'})
});

/* GET category_average page. */
router.get('/category_average', function(req, res, next) { 
  res.render('category_average',{title:'业务平均统计',page_name:'category_average'})
});

/* GET list page. */
router.get('/list', function(req, res, next) {
	res.render('list',{title:'数据列表',page_name:'list'})
});
module.exports = router;
