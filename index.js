let express=require("express");
let app=express();
let cors=require("cors");
app.use(cors());
let dotenv=require("dotenv");
dotenv.config();
let PORT=process.env.PORT;
app.use(express.json());
const api=require("./api");
let mongoose=require("mongoose");
let dbUrl=process.env.DB_URL;

app.listen(PORT, (err)=>{
    if(err){
        console.log(err);
    }
    console.log("Server started successfully at " + PORT);
});

mongoose.connect(dbUrl).then(()=>{
    console.log("connected to db");
})
.catch((error)=>{
    console.log("some error occurred");
});

app.use("/", api);

