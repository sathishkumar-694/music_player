import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import route from "./routes/authRoutes.js";
import songRouter from "./routes/songRoutes.js";

dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(express.json());
connectDB();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/auth", route );
app.use("/api/song",songRouter );
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working" });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});