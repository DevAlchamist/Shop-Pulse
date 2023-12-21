const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const cartSchema = new Schema({
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

});

const virtual = cartSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
cartSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const cartModel = model("Cart", cartSchema);

module.exports = cartModel;
