const express=require("express");
const axios=require("axios");
const router=express.Router();
const jwt=require("jsonwebtoken");
const Users=require("../Schema/UserSchema");

// API to login to IMDb
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

// API to login with google oauth
router.post("/oauth", async(req,res)=>{
    const userInfo = await axios
    .get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${req.body.token}` },
    })
    console.log(userInfo.data);
    const userEmail=userInfo.data.email;
    console.log(userEmail);
    const alreadyExists=await Users.findOne({Username:userEmail});
    if(alreadyExists){
        console.log(alreadyExists);
        const userDetails={uid:alreadyExists._id};
        const jwtToken=jwt.sign(userDetails,"mysecretkey");
        res.status(200).send({msg:"Already verified user", token:jwtToken});
    }
    else{
        const newUser={
            Username:userEmail,
            Password:"googlepass",
        };
        const thirdPartyUser=new Users(newUser);
        const thirdPartyUserAdded=await thirdPartyUser.save();
        if(thirdPartyUserAdded){
            console.log(thirdPartyUserAdded);
            const userDetails={uid:thirdPartyUserAdded._id};
            const jwtToken=jwt.sign(userDetails,"mysecretkey");
            res.status(200).send({msg:"oauth successfull", token:jwtToken});
        }
    }

})

module.exports=router;                              