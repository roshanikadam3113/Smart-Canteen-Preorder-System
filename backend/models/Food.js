const mongoose=require("mongoose");

const foodSchema=new mongoose.Schema({
    name:String,
    price:Number,
    category:String,
    image:String,
    inStock:Boolean
});

const Food=mongoose.model("Food",foodSchema);

module.exports=Food;