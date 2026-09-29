const transporter=require("../utils/emailService");

const sendInvoice=async(req,res)=>{

try{

const {email,subject,message}=req.body;

await transporter.sendMail({

from:process.env.EMAIL,

to:email,

subject,

text:message,

attachments:[
{
path:req.body.file
}
]

});

res.json({

success:true,

message:"Invoice Sent"

});

}catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};

module.exports={sendInvoice};