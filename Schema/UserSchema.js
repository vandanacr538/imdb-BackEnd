const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    Username:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    }
});

const Users=mongoose.model("User", schema);

module.exports=Users;