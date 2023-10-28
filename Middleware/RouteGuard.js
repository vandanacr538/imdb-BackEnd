const jwt=require("jsonwebtoken");

const RouteGuard=(req,res,next)=>{
    try{
        const isValid=jwt.verify(req.headers.authorization, "mysecretkey");
        if(isValid){
            req.decodedData=isValid;
            next();
        }
        else{
            res.status.send({msg:"Unauthorized"});
        }
    }
    catch(e){
        console.log(e);
        console.log("Invalid request");
        res.status(500).send({msg:"Something went wrong"});
    }
}

module.exports=RouteGuard;