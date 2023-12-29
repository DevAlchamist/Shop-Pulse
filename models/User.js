const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: Buffer,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  addresses: {
    type: [Schema.Types.Mixed],
  },
  name: {
    type: String,
    // required: true,
  },
  salt: Buffer,
  resetPasswordToken: { type: String, default: "" },
},{timestamps:true});

const virtual = userSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const userModel = model("User", userSchema);

module.exports = userModel;
