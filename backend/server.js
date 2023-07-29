const app=require('./app')
const dotenv=require('dotenv')
const connectDB=require('./config/database')
//handling uncaught err
process.on("uncaughtException",(err)=>{console.log(`Error:${err.message}`);console.log("Shutting down server due to uncaught exception");process.exit(1)})
// console.log(youtube)
dotenv.config({path:"backend/config/config.env"})
connectDB()
const server=app.listen(process.env.PORT,()=>{
    console.log(`Running on PORT:${process.env.PORT}`)
})
//unhandled promise rejection
process.on('unhandledRejection',(err)=>{console.log(`Error:${err.message}`);console.log(`Shutting down sever due to unhandled promise rejection`)
server.close(()=>{
    process.exit(1);
})});

