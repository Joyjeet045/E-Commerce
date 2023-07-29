const User=require("../models/userModel");
const Errorhandler = require("../utils/errorhandler");
const catchAsyncerr=require("../middleware/catchAsyncerr");
const sendToken=require("../utils/jwtToken")
const sendEmail=require("../utils/sendEmail.js")
const Product=require("../models/productModel")
//register
exports.registerUser=catchAsyncerr(async(req,res,next)=>{
    const {name,email,password}=req.body;
    const user=await User.create({
        name,email,password,
        avatar:{
            //temporary
            public_id:"this is a sample id",
            url:"profilepic",
        }
    })
    sendToken(user,201,res)
});
//LOGIN Users
exports.loginUser=catchAsyncerr(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
        next(new Errorhandler("Please enter a email or password",400));
    }
    const user=await User.findOne({email}).select("+password");
    if(!user){
        return next(new Errorhandler("Invalid email or password"),401);//401 is for unauthorized
    }
    const isPasswordMatched=user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new Errorhandler("Invalid email or password"),401);
    }
    sendToken(user,200,res)
})
//LogOut User
exports.logout=catchAsyncerr(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })
    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
})
//Forget Password
exports.forgotPassword=catchAsyncerr(async(req,res,next)=>{
    const user=await User.findOne({"email":req.body.email})
    if(!user){
        return next(new Errorhandler("User not found",404))
    }
    //Get resetPaasword token
    const resetToken=user.getResetPasswordToken();
    //saving the resetPasswordToken field after being updated
    await user.save({validateBeforeSave:false});
    //after deployment concerns
    const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    const message=`Your password reset token is:- \n\n${resetPasswordUrl}.If you have not requested this email,please ignore it`
    try{
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message
        });
        res.status(200).json({
            success:true,
            message:`Message sent to ${user.email} successfully`
        })
    }
    catch(err){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false});
        return next(new Errorhandler(err.message),500);
    }

})
//reset Password
exports.resetPassword=catchAsyncerr(async(req,res,next)=>{
    const resetToken=crypto.createHash("sha256").update(req.params.token).digest("hex")
    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    })
    if(!user){
        return next(new Errorhandler("Reset password token is invalid-Expired",400))
    }
    if(req.body.password!==req.body.confirmPassword){
        return next(new Errorhandler("Passwords don't match",400))
    }

    user.password=req.body.password
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save()
    sendToken(user,200,res);
})
exports.getUserDetails=catchAsyncerr(async(req,res,next)=>{
    const user=await User.findById(req.user.id);
    if(!user){
        return next(new Errorhandler("User not found",404))
    }
    res.status(200).json({
        success:true,
        user
    })
})
//update password
exports.updatePassword=catchAsyncerr(async(req,res,next)=>{
    const user=await User.findById(req.user.id).select("+password")
    if(!user){
        return next(new Errorhandler("User not found",404))
    }
    const isPsswordMatched=await user.comparePassword(req.body.oldPassword);
    if(!isPsswordMatched){
        return next(new Errorhandler("Old password is incorrect!",400))
    }
    if(req.body.newPassword!==req.body.confirmPassword){
        return next(new Errorhandler("password don't match!",400))
    }
    user.password=req.body.newPassword;
    await user.save()
    sendToken(user,200,res)
})
//update profile
exports.updateProfile=catchAsyncerr(async(req,res,next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }
    //will add cloudinary later
    const user=await User.findByIdAndUpdate(req.user._id,newUserData,{new:true})//note that req.user is accesible by jwt
    res.status(200).json({
        success:true,
        user
    })
})

//get all users--Admin
exports.getAllUsers=catchAsyncerr(async(req,res,next)=>{
    const users=await User.find();
    res.status(200).json({
        success:true,
        users
    })
})
//get single user--Admin(here we use params.id)
exports.getSingleUser=catchAsyncerr(async(req,res,next)=>{
    const user=await User.findById(req.params.id);
    if(!user){
        return next(new Errorhandler(`User not found with id ${req.params.id}`,404))
    }
    res.status(200).json({
        success:true,
        user
    })
})
//update user role--Admin
exports.updateUserRole=catchAsyncerr(async(req,res,next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{new:true})//note that req.user is accesible by jwt
    res.status(200).json({
        success:true,
        user
    })
})
//delete user--Admin
exports.deleteUser=catchAsyncerr(async(req,res,next)=>{
    const user=await User.findById(req.params.id);
    if(!user){
        return next(new Errorhandler(`User not found with id ${req.params.id}`,400))
    }
    await User.deleteOne(user);
    res.status(200).json({
        success:true,
        user,
        message:"User deleted successfully!"
    })
})


