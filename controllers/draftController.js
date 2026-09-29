const Draft = require("../models/Draft");

const saveDraft = async(req,res)=>{

try{

const draft=await Draft.create({
    userId:req.user._id,
    data:req.body
});

res.status(201).json({
    success:true,
    message:"Draft Saved",
    data:draft
});

}catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};

const getDrafts=async(req,res)=>{

const drafts=await Draft.find({
userId:req.user._id
});

res.json(drafts);

};

const deleteDraft=async(req,res)=>{

await Draft.findByIdAndDelete(req.params.id);

res.json({
success:true
});

};

module.exports={
saveDraft,
getDrafts,
deleteDraft
};