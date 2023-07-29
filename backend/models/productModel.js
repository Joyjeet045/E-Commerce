const mongoose=require('mongoose')
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter product Name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please enter product description"]
    },
    price:{
        type:Number,
        required:[true,"Please enter product Price"],
        maxLength:[8,"Price cannot exceed 8 figures"]
    },
    ratings:{
        type:Number,
        default:0
    },
    //array as a sinle product may have multiple images
    images:[{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    }],
    category:{
        type:String,
        required:[true,"Please enter product category"],
        //can do enum:['footwear','jewellery;],default:'footwear' but we will handle this in frontend
    },
    Stock:{
        type:Number,
        required:[true,"Please enter product category"],
        maxLength:[4,"Stocks cannot exceed 4 characters"],//maxtill 10^4
        default:1,
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    }

})
module.exports=mongoose.model("Product",productSchema)