const express=require('express');

const router =express.Router();

const User=require('../models/User');

router.post('/register',async(req,res)=>{
    try{
        const newUser=await User.create(req.body);

        res.send(newUser);
    }catch(error){
        res.send(error);
    }
});

router.post('/login',async(req,res)=>{
    try{
       const user =await User.findOne({
        email:req.body.email
       });

       if(!user){
        return res.send("User not found");
       }
       
       if(user.password!==req.body.password){
        return res.send("Invalid password");
       }
       res.send(user);

    }catch(error){
        res.status(500).send(error);
    }
});

module.exports=router;