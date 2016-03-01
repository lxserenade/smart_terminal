var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test',function(err){
	if(err){
		console.log(err);
		return;
	}else{
		console.log('connected to mongodb!')
	}
});
module.exports = mongoose;