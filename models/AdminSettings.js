//models\AdminSettings.js

const mongoose = require('mongoose');

const AdminSettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sotripCoin: {
    amount:{
        type: Number,
        default: 0
    },
    currency:{
        type: String,
        default: 'USD'
    },
   
    coin:{
        type: Number,
        default: 0
    },
   
  },

  loginAttenpts:{
    type: Number,
    default: 5
},

lockTime:{
  type: Date,
  default: 5
},

 
});


const adminSetting = mongoose.model('AdminSetting', AdminSettingSchema);
module.exports = adminSetting;
