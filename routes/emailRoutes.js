const express=require("express");

const router=express.Router();

const protect=require("../middleware/authMiddleware");

const {sendInvoice}=require("../controllers/emailController");

router.post("/",protect,sendInvoice);

module.exports=router;