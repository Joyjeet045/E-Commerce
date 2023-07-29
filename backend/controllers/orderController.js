const Order=require("../models/orderModel");
const Product=require("../models/productModel")
const Errorhandler = require("../utils/errorhandler");
const catchAsyncerr=require("../middleware/catchAsyncerr")

//create new order
exports.newOrder=catchAsyncerr(async(req,res,next)=>{
    const {shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice}=req.body;
    const order=await Order.create({shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice,paidAt:Date.now(),user:req.user._id});
    
    res.status(201).json({
        success:true,
        order
    })
})
//get loggedIn user Orders
exports.myOrders=catchAsyncerr(async(req,res,next)=>{
    const orders=await Order.find({user:req.user._id})
    
    res.status(201).json({
        success:true,
        orders
    })
})
//get Single Order--By User once he finds his all orders
exports.getSingleOrder=catchAsyncerr(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email")
    if(!order){
        return next(new Errorhandler("Order not found with this id",404))
    }
    res.status(201).json({
        success:true,
        order
    })
})
//Admin route--All products
exports.getAllOrders=catchAsyncerr(async(req,res,next)=>{
    const orders=Order.find();
    let totalAmount=0;
    orders.forEach(order=>totalAmount+=order.totalPrice)
    res.status(201).json({
        success:true,
        orders,totalAmount
    })
})
//Update Order--Admin
exports.updateOrder=catchAsyncerr(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);
    //for checking if we are delivering the already delivered item

    if (order.orderStatus==='Delivered'){
        return next(new Errorhandler("You have already delivered this product",400));
    }
    order.orderItems.forEach(async (o)=>{
        await updateStock(o.product,o.quantity)
    })

    order.orderStatus=req.body.status;
    //for setting delivered date
    if(req.body.status==='Delivered'){
        order.delivered=Date.now()
    }
    await order.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
        order
    })
})
async function updateStock(id,quantity){
    const product=await Product.findById(id);
    product.Stock-=quantity //subtract the stock by the quantity which has delivered
    await product.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        product
    })
}
//delete Order--Admin
exports.deleteOrder=catchAsyncerr(async(req,res,next)=>{
    const order=await Product.findById(req.params.id);
    if(!order){
        return next(new Errorhandler("Order not found with this id",404))
    }
    await Order.deleteOne(order)
    res.status(200).json({
        success:true,
        order
    })
})