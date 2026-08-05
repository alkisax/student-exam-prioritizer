// backend\src\server.ts
/* eslint-disable no-console */
import "dotenv/config";
import http from "http";

import { app } from "./app";
import { PORT, MONGODB_URI } from "./constants/constants";
import { connectMongo } from "./db/mongo";

const main = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  await connectMongo(MONGODB_URI);

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

main().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
