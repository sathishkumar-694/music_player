import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";

dotenv.config();
const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.json());
connectDB();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});