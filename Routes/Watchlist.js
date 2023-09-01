const express = require("express");
const router = express.Router();
const jwt=require("jsonwebtoken");
const Watchlist = require("../Schema/WatchlistSchema");

// API to add movies to watchlist
router.post("/addtowatchlist", async (req, res) => {
    const {
    backdrop_path,
    id,
    original_title,
    overview,
    poster_path,
    release_date,
    vote_average,
  } = req.body;
  const decodeToken=jwt.verify(req.headers.authorization, "mysecretkey");

  const newMovie = {
    userid:decodeToken.uid,
    backdrop_path: backdrop_path,
    id: id,
    original_title: original_title,
    overview: overview,
    poster_path: poster_path,
    release_date: release_date,
    vote_average: vote_average,
  };
  const movie = new Watchlist(newMovie);
  const movieAdded = await movie.save();
  if (movieAdded) {
    console.log(movieAdded);
  }
});

// API to get my watchlist
router.get("/mywatchlist", async(req,res)=>{
    const decodeToken=jwt.verify(req.headers.authorization, "mysecretkey");
    console.log(decodeToken.uid);
    const mywatchlist= await Watchlist.find({userid:decodeToken.uid});
    if(mywatchlist){
        const obj={results:mywatchlist}
        res.status(200).send(obj);
    }
    else{
        res.status(200).send({msg:"No data found"});
    }
});


module.exports = router;
