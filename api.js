const express=require("express");
const router=express.Router();

const login=require("./Routes/Login");
const watchlist=require("./Routes/Watchlist");

router.use("/login", login);
router.use("/watchlist", watchlist);

module.exports=router;