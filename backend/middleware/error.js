const Errorhandler=require("../utils/errorhandler");
module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.message= err.message || "Internal Server Error";
    //  Wrong mongo ID err
    if(err.name==="CastError"){
        const message=`Resource nor found.Invalid:${err.path}`;
        err=new Errorhandler(message,400);
    }
    //Mongoose duplicate key error
    //11000 will be displayed as E11000 
    if(err.code===11000){
        const message=`Duplicate ${Object.keys(err.keyValue)} entered`
        err=new Errorhandler(message,400);
    }
    //Wrong JWT->if incoming token is null somehow
    if(err.name==='JsonWebToken'){
        const message=`JSON Web Token is invalid,Try Again!!`
        err=new Errorhandler(message,400);
    }
    //JWT Expired
    if(err.name==='TokenExpiredError'){
        const message=`jwt has expired`
        err=new Errorhandler(message,400);
    }
    
    res.status(err.statusCode).json({success:false,message:err.message});
}