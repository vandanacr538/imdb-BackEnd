const express=require("express");
const router=express.Router();

const login=require("./Routes/Login");

router.use("/login", login);

module.exports=router;