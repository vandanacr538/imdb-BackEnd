const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    // Username:{
    //     type:String,
    //     required:true
    // },
    // Password:{
    //     type:String,
    //     required:true
    // }
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
        required:true
    }
});

const Users=mongoose.model("User", schema);

module.exports=Users;