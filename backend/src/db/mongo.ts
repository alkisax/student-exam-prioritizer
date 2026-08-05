// backend\src\db\mongo.ts
import mongoose from "mongoose";

export const connectMongo = async (mongoUri: string) => {
  await mongoose.connect(mongoUri);
  console.log("connected to mongo db");
};