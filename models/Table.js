const mongoose = require("mongoose");
const TableSchema = new mongoose.Schema({
  name: { type: String, required: true }, // tên khách hàng
  phoneNumber: { type: String },
  numberOfPeople: { type: Number, required: true },
  dateTime: { type: Date, required: true },
  note: { type: String },
  email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Table", TableSchema);
