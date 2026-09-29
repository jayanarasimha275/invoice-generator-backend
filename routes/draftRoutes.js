const express=require("express");

const router=express.Router();

const protect=require("../middleware/authMiddleware");

const {
saveDraft,
getDrafts,
deleteDraft
}=require("../controllers/draftController");

router.post("/",protect,saveDraft);

router.get("/",protect,getDrafts);

router.delete("/:id",protect,deleteDraft);

module.exports=router;