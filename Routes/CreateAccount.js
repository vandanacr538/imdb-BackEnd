const express=require("express");
const router = express.Router();
const jwt=require("jsonwebtoken");
const dotenv=require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const CreateUser=require("../Schema/UserSchema");
const RouteGuard=require("../Middleware/RouteGuard");
const base64=require("base-64");

function generateOtp() {        
    const otp = Math.random() * 1000000;
    return Math.trunc(otp);
}
const sendOTP=async(otp, newUserEmailID)=>{
    const transporter=nodemailer.createTransport({
        service: "Gmail",
        host: 'smtp.gmail.com',
        auth: {
            user:process.env.NODEMAILER_USERNAME, 
            pass:process.env.NODEMAILER_PASSWORD, 
        },
    });
    const mailHTML="<h1>Welcome to IMDb</h1>"+`<h3>Your OTP to complete IMDb new account creation process: ${otp}</h3>`;
    const info=await transporter.sendMail({
        from:process.env.NODEMAILER_USERNAME,  
        to:newUserEmailID, 
        subject:" Verify your new IMDb account ✔", 
        text:"OTP verification", 
        html:mailHTML, 
    });
}

// API to create account for new user
router.post("/createaccountapi", async(req, res)=>{
    try{
        const decodeCreateAccData=JSON.parse(base64.decode(req.headers.authorization));
        const{name, email, password, re_enter_password}=decodeCreateAccData;
        console.log(req.body);
        let otp = generateOtp();
        const newUserData={
            name: name,
            email: email,
            password: password,
            re_enter_password: re_enter_password,
            otp:otp
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
                sendOTP(otp, newUserAdded.email);
                console.log("OTP sent");
                setTimeout(async () => {
                    console.log(' otp expiration time starts now ')
                    newUserAdded.otp='';
                    await newUserAdded.save();
                }, 300000);
            }
            else{
                res.status(500).send({msg:"Internal Server Error"});
            }
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send({msg:"Something went wrong"});
    }
});

// API to verify OTP
router.post("/verifyotp", async (req,res)=>{
    try{
        const decodeOTPData=JSON.parse(base64.decode(req.headers.authorization));
        const {email, otp} = decodeOTPData;
        console.log(decodeOTPData);
        const userExists=await CreateUser.findOne({email:email});
        const jwtToken=jwt.sign(userExists.toJSON(),"mysecretkey");
        if(userExists){
            if(userExists.otp===otp){
                res.status(200).send({msg:"OTP verified and your new IMDb account is created", token:jwtToken});
            }
            else if(userExists.otp===""){ 
                res.status(410).send({msg:"OTP has expired, Try Again!"}); 
            }
            else{
                res.status(401).send({msg:"Invalid OTP. Please check your code and try again."});
            }
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send({msg:"Something went wrong"});
    }
})

// API to resend OTP
router.post("/resendotp", async(req, res)=>{
    try{
        const email=base64.decode(req.headers.authorization);
        let otp = generateOtp();
        const userExists=await CreateUser.findOne({email:email});
        if(userExists){
            const newOTP=await CreateUser.findOneAndUpdate({email:email},{
                otp:otp
            });
            res.status(200).send({msg:"OTP sent"});
            sendOTP(otp, email);
            setTimeout(async () => {
                console.log(' otp expiration time starts now ')
                userExists.otp='';
                await userExists.save();
            }, 300000);
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send({msg:"Something went wrong"});
    }
})

// API to edit user profile
router.post("/edituserdata", async (req, res)=>{
    try{
        const decodeEditUserProfile=JSON.parse(base64.decode(req.headers.authorization))
        // console.log(decodeEditUserProfile);
        const {name, email, new_password, re_enter_new_password}=decodeEditUserProfile;
        const updatedUserData=await CreateUser.findOneAndUpdate({email:email},{
            name: name,
            email: email,
            password: new_password,
            re_enter_password: re_enter_new_password,
        });
        if(updatedUserData){
            console.log(updatedUserData);
            const jwtToken=jwt.sign(updatedUserData.toJSON(),"mysecretkey");
            res.status(200).send({msg:"Edited user data updated successfully!", token:jwtToken});
        }
        else{
            res.status(404).send({msg:"User Not Found"});
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send({msg:"Something went wrong"});
    }
})

// API to get UserProfile data
router.post("/getuserprofiledata", RouteGuard, async function(req,res){
    try{
        const {email}=req.decodedData;
        const userExists=await CreateUser.findOne({email:email});
        const jwtToken=jwt.sign(userExists.toJSON(),"mysecretkey");
        if(userExists){
            res.status(200).send({token:jwtToken});
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send({msg:"Something went wrong"});
    }
})
module.exports=router;