import mongoose from "mongoose"

function connect() {
  mongoose.connect(process.env.MONGO_URL)
    .then(() => {
      console.log("MongoDB was  connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
}
export default connect;