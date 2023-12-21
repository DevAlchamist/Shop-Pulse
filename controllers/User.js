const userModel = require("../models/User");

const fetchUserById = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await userModel.findById(id).exec();
    res
      .status(200)
      .json({
        id: user.id,
        addresses: user.addresses,
        email: user.email,
        role: user.role,
      });
  } catch (error) {
    res.status(400).json(error);
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = { fetchUserById, updateUser };
