const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    backdrop_path:{
        type:String,
        required:true
    },
    id:{
        type:String,
        required:true
    },
    original_title:{
        type:String,
        required:true
    },
    overview:{
        type:String,
        required:true
    },
    poster_path:{
        type:String,
        required:true
    },
    release_date:{
        type:Date,
        required:true
    },
    vote_average:{
        type:Number,
        required:true
    },
});

const Watchlist=mongoose.model("mywatchlist", schema);

module.exports=Watchlist;