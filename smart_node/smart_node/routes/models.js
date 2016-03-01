var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var terminals = new Schema({
	institution : String,
	terminal_name:String,
	terminal_id:String,
	category:String,
	touch_id:String,
	click : String,
	date:Date
});

exports.terminals = mongoose.model('terminals',terminals); 