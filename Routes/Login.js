const express=require("express");
const router=express.Router();
const jwt=require("jsonwebtoken");
const Users=require("../Schema/UserSchema");

router.post("/loginapi", async(req, res)=>{
    const{username, password}=req.body;
    const userExist=await Users.findOne({Username:username});
    if(userExist){
        if(userExist.Password===password){
            const userDetails={uid:userExist._id};
            const token=jwt.sign(userDetails,"mysecretkey");
            res.status(200).send({token:token});
        }
        else{
            res.status(403).send({msg:"username or password is incorrect"});
        }
    }
    else{
        res.status(401).send({msg:"User is not registered"});
    }
});

module.exports=router;