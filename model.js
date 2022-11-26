var mongoose = require('mongoose'); 
  
var users = new mongoose.Schema({  
    name: String,
    phone: String,
    email: String,
    linkedIn: String,
}); 
  
module.exports = new mongoose.model('Users', users);