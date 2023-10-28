const express = require("express");
const router = express.Router();
const jwt=require("jsonwebtoken");
const Watchlist = require("../Schema/WatchlistSchema");
const RouteGuard=require("../Middleware/RouteGuard");

// API to add movies to watchlist
router.post("/addtowatchlist", RouteGuard, async (req, res) => {
 try{
    const {
      backdrop_path,
      id,
      original_title,
      overview,
      poster_path,
      release_date,
      vote_average,
    } = req.body;
    const {_id} = req.decodedData;
    const newMovie = {
      userid:_id,
      backdrop_path: backdrop_path,
      id: id,
      original_title: original_title,
      overview: overview,
      poster_path: poster_path,
      release_date: release_date,
      vote_average: vote_average,
    };
    const alreadyExist=await Watchlist.findOne({userid:_id, id:id});
    if(alreadyExist){
      res.status(200).send({msg:"This movie alraedy exists in Watchlist"});
    }
    else{
      const movie = new Watchlist(newMovie);
      const movieAdded = await movie.save();
      if (movieAdded) {
        res.status(200).send({msg:"movie added to watchlist"});
      }
    }
 }
 catch(e){
  console.log(e);
  res.status(500).send({msg:"Something went wrong"});
 }
});

// API to get my watchlist
router.get("/mywatchlist", RouteGuard, async(req,res)=>{
  try{
    const mywatchlist= await Watchlist.find({userid:req.decodedData._id});
    if(mywatchlist){
        const obj={results:mywatchlist}
        res.status(200).send(obj);
    }
    else{
        res.status(200).send({msg:"No data found"});
    }
  }
  catch(e){
    console.log(e);
    res.status(500).send({msg:"Something went wrong"});
  }
});

// API to remove a movie from Watchlist
router.delete("/deletemoviefromwatchlist", RouteGuard, async (req, res) => {
  try{
    const {id} =req.body.element;
    const isDeleted = await Watchlist.deleteOne({ userid:req.decodedData._id, id: id });
    if (isDeleted.deletedCount) {
      console.log(isDeleted);
      res.status(200).send({ msg: "data deleted " });
    } else {
      res.status(401).send({ msg: "issue occured" });
    }
  }
  catch(e){
    console.log(e);
    res.status(500).send({msg:"Something went wrong"});
  }
});

module.exports = router;
