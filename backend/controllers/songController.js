import axios from "axios";
const getSongs = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.jamendo.com/v3.0.tracks?client_id=a263e739&format=jsonpretty&limit=15`
    );
    const data = response.data;
    res.status(200).json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getPlayListByTag = async (req, res) => {
  try {
    const tag = (req.params.tag || req.query.tag || "").toString().trim();
    if (!tag)
      return res.status(400).json({ message: "missing tag parameters" });
    const limit = parseInt(req.query.limit ?? "10", 10) || 10;
    const clientId = "a263e739";
    const params = {
      client_id: clientId,
      format: "jsonpretty",
      tags: tag,
      limit,
    };
    const response = await axios.get("https://api.jamendo.com/v3.0/tracks/", {
      params,
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "getPlaylistTag error",
      error?.response.data ?? error.message ?? error
    );
    return res.status(500).json({ message: "failed to fetch" });
  }
};

const toggleFavSong = async (req, res) => {
  try {
    const user = req.user;
    const song = req.body.song;
    const exists = user.favourites.find((fav) => fav.id === song.id);
    if (exists) {
      user.facourites = user.favourites((f) => f.id !== song.id);
    } else user.favourites.push(song);
    await user.save();
    return res.status(200).json(user.favourites);
  } catch (e) {
    console.error(e.message);
    return res
      .status(400)
      .json({ message: "favourites not added , something went wrong" });
  }
};

export { getSongs, getPlayListByTag, toggleFavSong };
