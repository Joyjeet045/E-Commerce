const Product=require("../models/productModel");
const Errorhandler = require("../utils/errorhandler");
const catchAsyncerr=require("../middleware/catchAsyncerr");
const ApiFeatures = require("../utils/apifeatures");
//create a product-Admin
exports.createProduct=catchAsyncerr(async(req,res,next)=>{
    //req.user we are getting from the jwt
    req.body.user=req.user.id
    const product=await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    })
})
//get all product
exports.getAllProducts=catchAsyncerr(async(req,res,next)=>{
    // return next(new Errorhandler("Temp error",500))
    const resultPerPage=8;
    const productCount=await Product.countDocuments();//count no of products to be displayed in dashboard
    const apiFeature=new ApiFeatures(Product.find(),req.query).
    search().
    filter().
    pagination(resultPerPage);

    const products=await apiFeature.query;
    res.status(200).json({
        success:true,products,productCount
    })
})
exports.getProductDetails=catchAsyncerr(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhandler("Product not found",404))
    }
    
    res.status(200).json({
        success:true,
        product
    })
})
//update product--Admin
exports.updateProduct=catchAsyncerr(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhandler("Product not found",404))
    }
    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true
    });
    res.status(200).json({
        success:true,
        product
    })
})
exports.deleteProduct=catchAsyncerr(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhandler("Product not found",404))
        }
    await Product.deleteMany(product);
    res.status(200).json({
        success:true,
        message:"Deleted successfully"
    })
})
//create new reviews/update the review
exports.createProductReview=catchAsyncerr(async(req,res,next)=>{
    const {rating,comment,productId}=req.body
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    };
    const product=await Product.findById(productId);
    const isReviewed=product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString())
    //if already reviewed
    if(isReviewed){
     product.reviews.forEach(rev=>
        {if(rev.user.toString()===req.user._id.toString()){
            //update the rating and comment
            rev.rating=rating,
            rev.comment=comment
        }})   
    }
    else{
        product.reviews.push(review)
    }
    let avg=0;
    product.reviews.forEach(rev=>avg+=rev.rating);
    product.ratings=avg/product.reviews.length;
    await product.save({validateBeforeSave:false})
    res.status(200).json({
        success:true
    })
})
exports.getProductReviews=catchAsyncerr(async(req,res,next)=>{
    const product=await Product.findById(req.query.id);
    if(!product){
        return next(new Errorhandler("Product not found",404));
    }
    res.status(200).json({
        success:true,reviews:product.reviews
    })
})
exports.deleteReviews=catchAsyncerr(async(req,res,next)=>{
    const product=await Product.findById(req.query.productId);
    if(!product){
        return next(new Errorhandler("Product not found",404));
    }
    const reviews=product.reviews.filter(rev=>rev._id.toString()!==req.query.id)
    let avg=0;
    reviews.forEach(rev=>avg+=rev.rating);
    const ratings=avg/reviews.length;
    const NumofReviews=reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,ratings,NumofReviews
    },{new:true})
    res.status(200).json({
        success:true
    })
})




