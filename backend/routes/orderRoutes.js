const express=require('express');

const router=express.Router();  

const Order=require('../models/Order');

router.post('/',async(req,res)=>{
    try{
        const newOrder=await Order.create(req.body);    
        res.send(newOrder);
    }catch(error){
        res.send(error);
    }

});

router.get('/',async(req,res)=>{
    try{
        const orders=await Order.find();
        res.send(orders);
    }catch(error){
        res.send(error);
    }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );

    res.send(updatedOrder);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports=router;  