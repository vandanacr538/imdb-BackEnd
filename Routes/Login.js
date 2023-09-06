const express=require("express");
const router=express.Router();
const jwt=require("jsonwebtoken");
const Users=require("../Schema/UserSchema");
const {OAuth2Client}=require("google-auth-library");

// Function to decode Google OAuth token
const getDecodedOAuthJwtGoogle=async(token)=>{
    const CLIENT_ID_GOOGLE = '<enter your Google ClientId>';
    try{
        const client=new OAuth2Client(CLIENT_ID_GOOGLE);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID_GOOGLE,
        })
      
        return ticket;
    }
    catch(error){
        return { status: 500, data: error }
    }
} 


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
    const tokenInfo = await getDecodedOAuthJwtGoogle(req.body.token);
    const userEmail=JSON.parse(JSON.stringify(tokenInfo)).payload.email;
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