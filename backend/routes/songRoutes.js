import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getPlayListByTag, getSongs, toggleFavSong } from "../controllers/songController.js";

const songRouter = express.Router();
songRouter.get("/",getSongs);
songRouter.get("/playListByTag", getPlayListByTag);
songRouter.post("/favsong" ,protect, toggleFavSong);
songRouter.get("/fav", protect , (req,res)=>
{
    res.json(req.user.favourites)
});
export default songRouter;