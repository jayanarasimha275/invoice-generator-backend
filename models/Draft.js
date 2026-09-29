const mongoose = require("mongoose");

const draftSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    data:{
        type:Object,
        required:true
    }
},
{
    timestamps:true
});

module.exports = mongoose.model("Draft",draftSchema);