const express=require("express");
const router=express.Router();

const login=require("./Routes/Login");
const watchlist=require("./Routes/Watchlist");
const createAccount=require("./Routes/CreateAccount");

router.use("/login", login);
router.use("/watchlist", watchlist);
router.use("/createaccount", createAccount);

module.exports=router;