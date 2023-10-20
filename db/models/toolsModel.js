const mongoose = require("mongoose");
const { Schema } = mongoose;

const toolsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for tool"],
  },
  type: {
    type: String,
    enum: ["Ручний інструмент", "Електро інструмент", "Бензо інструмент"],
    default: "Ручний інструмент",
    required: [true, "Set name for tool"],
  },
  toolPicture: {
    type: String,
    required: [true, "Tool picture is required"],
  },
  serialNumber: {
    type: String,
    required: [true, "Serial number is required"],
  },
  cityLocation: {
    type: String,
    required: [true, "City location number is required"],
  },
  // =======================================  this chenge with a orders
  status: {
    type: String,
    enum: ["Доступний", "Недоступний", "В ремонті"],
    default: "Доступний",
  },
  // =======================================
  specifications: [
    {
      label: String,
      value: String,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  // ======================================= this chenge with a orders
  workingDays: {
    type: Number,
    default: 0,
  },
  earnedMoney: {
    type: Number,
    default: 0,
  },
  // =======================================
  tags: {
    type: [String],
    default: function () {
      return [this.name];
    },
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],

  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Stor",
    required: [true, "The tool must belong to the magazine"],
  },
  users: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Tool = mongoose.model("Tool", toolsSchema);

module.exports = {
  Tool,
};
