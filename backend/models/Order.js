const mongoose=require("mongoose");

const orderSchema= new mongoose.Schema({
    userName:String,
    rollNumber:String,

    items:Array,

    totalAmount:Number,

    slot:String,

    paymentMethod:String,

    tokenNumber:String,

    status:{
        type:String,
        default:"Preparing"
    }
});

const Order=mongoose.model("Order",orderSchema);

module.exports=Order;