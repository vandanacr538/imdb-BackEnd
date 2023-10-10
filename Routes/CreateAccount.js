const express=require("express");
const router = express.Router();
const jwt=require("jsonwebtoken");
const CreateUser=require("../Schema/UserSchema");

// API to create account for new user
router.post("/createaccountapi", async(req, res)=>{
    const{name, email, password, re_enter_password}=req.body;
    console.log(req.body);
    const newUserData={
    name: name,
    email: email,
    password: password,
    re_enter_password: re_enter_password
    }
    const alreadyUserExists=await CreateUser.findOne({email:email});
    if(alreadyUserExists){
        console.log(alreadyUserExists);
        console.log("alreadyexists")
        const userDetails={uid:alreadyUserExists._id};
        const jwtToken=jwt.sign(userDetails,"mysecretkey");
        res.status(200).send({msg:"You indicated you're a new customer, but an account already exists with the email address "+alreadyUserExists.email, token:"already exists"});
    }
    else{
        const user = new CreateUser(newUserData);
        const newUserAdded = await user.save();
        const jwtToken=jwt.sign(newUserAdded.toJSON(),"mysecretkey");
        if (newUserAdded) {
            res.status(200).send({msg:"New user added successfully!", token:jwtToken});
        }
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
});

module.exports=router;