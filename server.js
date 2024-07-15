const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// import connectDb from "./db/index.js";
const { connectDb } = require("./src/db/index");
const userRouter = require("./src/routes/userRouter");
dotenv.config({
  path: "./.env",
});

let port = process.env.PORT || 8001;
connectDb()
  .then(() => {
    app.on("error", (err) => {
      console.log("error", err);
      throw err;
    });
    app.listen(port, () => {
      console.log(`server is listening on ${port}`);
    });
  })
  .catch((err) => {
    console.log("DB connection failed", err);
  });

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
console.log("app");
app.use("/api/v1/employee", userRouter);
