const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    re_enter_password:{
        type:String,
        // required:true
    },
    otp:{
        type:String
    }
});

const Users=mongoose.model("User", schema);

module.exports=Users;