const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  fileName: {
    type: String,
  },
  code: {
    type: Number,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
