const express=require("express");
const router = express.Router();
const jwt=require("jsonwebtoken");
const dotenv=require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const CreateUser=require("../Schema/UserSchema");

function generateOtp() {
    const otp = Math.random() * 1000000;
    return Math.trunc(otp);
}
const transporter=nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port:587,
    auth: {
        user:process.env.NODEMAILER_USERNAME, 
        pass:process.env.NODEMAILER_PASSWORD, 
    },
});

// API to create account for new user
router.post("/createaccountapi", async(req, res)=>{
    const{name, email, password, re_enter_password}=req.body;
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
            const mailHTML="<h1>Welcome to IMDb</h1>"+`<h3>Your OTP to complete IMDb new account creation process: ${otp}</h3>`;
            const info=await transporter.sendMail({
                from:process.env.NODEMAILER_USERNAME,  
                to:newUserAdded.email, 
                subject:" Verify your new IMDb account ✔", 
                text:"OTP verification", 
                html:mailHTML, 
            });
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
});

// API to verify OTP
router.post("/verifyotp", async (req,res)=>{
    const {email, otp} = req.body;
    console.log(otp);
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
})

module.exports=router;