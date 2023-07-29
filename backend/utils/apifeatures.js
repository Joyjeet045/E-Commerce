class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex:this.queryStr.keyword,//matches for this word in another word
                $options:"i",//case-insensitive
            }
        }:{};

        
        this.query=this.query.find({...keyword});
        return this
        //it is to search for different keywords and page no.
    }
    filter(){
        const queryCopy={...this.queryStr}//spread operator is used to pass this a copy not a ref.
        //remove some fields for category
        const removeFields=["keyword","page","limit"];
        removeFields.forEach((key)=>{
            delete queryCopy[key]
        })
        let queryStr=JSON.stringify(queryCopy);
        queryStr=queryStr.replace(/\b(gte|gt|lt|lte)\b/g,key=>`$${key}`)
        this.query=this.query.find(JSON.parse(queryStr));
        return this;//filter for category and it is case sensitive as category tyes can't be changed
    }
    pagination(resultPerPage){
        const currentPage=Number(this.queryStr.page) || 1;
        const skip=resultPerPage*(currentPage-1);
        this.query=this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}
module.exports=ApiFeatures