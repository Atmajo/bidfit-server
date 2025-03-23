import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index";
import limiter from "./middleware/limiter";

// Load environment variables
dotenv.config();

const app: Express = express();
const port = 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN!,
    credentials: true,
  })
);
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.use("/api", routes);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running");
});

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
