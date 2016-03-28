var mongoose = require('mongoose'),

//User collection
BoxoUsers = new mongoose.Schema({
  dbB_nameUsr:        { type: String },
  dbB_ltNameUsr:      { type: String },
  dbB_dateBorn :      { type: String },
  dbB_nickname:       { type: String },
  dbB_password:       { type: String },
  dbB_cities:         { type: String },
  dbB_locationSaved:  { type: String },
  dbB_typeRol:        { type: Number },
  dbB_email:          { type: String },
  dbB_fechaRegistro:  { type: String }
});

module.exports = mongoose.model('boxousers',BoxoUsers);
