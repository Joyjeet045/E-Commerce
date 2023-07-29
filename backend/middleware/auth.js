const Errorhandler = require("../utils/errorhandler");
const catchAsyncerr=require("./catchAsyncerr")
const jwt=require("jsonwebtoken")
const User=require("../models/userModel");
exports.isAuthenticatedUser=catchAsyncerr(async(req,res,next)=>{
    const {token}=req.cookies;//cookies are bind to the request object
    //if existing cookies if not present->once logged out the cookie
    //is removed so it directs us to login again
    if(!token){
        next(new Errorhandler("Please login to acess this resource",401));
    }
    //if cookie is present
    const decodedData=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decodedData.id);
    //we can now access this user from anywhere with req.user
    next();
})
exports.authorizeRoles=(role)=>{
    return (req,res,next)=>{
        //we set role='admin' here
        if(role!=(req.user.role)){
            return next(new Errorhandler(`Role: ${req.user.role} is not allowed to access this resource`,403))
        }
        next();
    }
    
}