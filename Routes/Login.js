const express=require("express");
const axios=require("axios");
const router=express.Router();
const jwt=require("jsonwebtoken");
const Users=require("../Schema/UserSchema");
const base64=require("base-64");

// API to login to IMDb
router.post("/loginapi", async(req, res)=>{
    try{
        const{email, password}=JSON.parse(base64.decode(req.headers.authorization));
        const userExist=await Users.findOne({email:email});
        if(userExist){
            if(userExist.password===password){
                const jwtToken=jwt.sign(userExist.toJSON(),"mysecretkey");
                res.status(200).send({token:jwtToken});
            }
            else{
                res.status(403).send({msg:"email or password is incorrect"});
            }
        }
        else{
            res.status(401).send({msg:"User is not registered"});
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send({msg:"Something went wrong"});
    }
});

// API to login with google oauth
router.post("/oauth", async(req,res)=>{
    try{
        const userInfo = await axios
        .get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${req.headers.authorization}` },
        })
        const {name, email}=userInfo.data;
        const alreadyExists=await Users.findOne({email:email});
        if(alreadyExists){
            console.log(alreadyExists);
            const jwtToken=jwt.sign(alreadyExists.toJSON(),"mysecretkey");
            res.status(200).send({msg:"Already verified user", token:jwtToken});
        }
        else{
            const newUser={
                name:name,
                email:email,
                password:"googlepass",
            };
            const thirdPartyUser=new Users(newUser);
            const thirdPartyUserAdded=await thirdPartyUser.save();
            if(thirdPartyUserAdded){
                console.log(thirdPartyUserAdded);
                const jwtToken=jwt.sign(thirdPartyUserAdded.toJSON(),"mysecretkey");
                res.status(200).send({msg:"oauth successfull", token:jwtToken});
            }
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send({msg:"Something went wrong"});
    }
})

module.exports=router;                              