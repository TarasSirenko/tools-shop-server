
const {
  createUser,
  userVerificationCheck,
  reVerification,
  loginUser,
  logoutUser,
  getUsers,
  getUserById,
  getUserByPhone,
  deleteUserById,
  updateUserStatus,
  addToAccess,
  removeFromAccess,
  updateUserStatistics,
  updateUserInfo,
  changePasswordRequest,
  changePassword,
  userChengePassword
} = require("../services/usersServices");

const createUserController = async (req, res) => {
  const { email, password, phone } = req.body;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const result = await createUser(email, password, phone, baseUrl);

  if (result === "Email already in use")
    res.status(409).json({ message: "Email already in use" });

  const { subscription } = result;

  return res.status(201).json({ email, subscription });
};
const userVerificationCheckController = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await userVerificationCheck(verificationToken);
  if (!user) return res.status(404).json({message:"User not found"});
    return res.redirect(
      "https://655b5ff58ad8c50fd222db71--tools-shop.netlify.app/login"
    );
};
const reVerificationController = async (req, res) => {
  const { email } = req.body;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  if (!email) return res.status(400).json({message:"Missing required field email"});
  const user = await reVerification(email, baseUrl);
  if (user === "user") return res.status(404).json({message:"User not found"});
    if (!user)
      return res.status(403).json({message:"Verification has already been passed"});
  return res.status(200).json({message:"Verification email sent"});
};
const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUser(email, password);
  if (user === "Not verified") return res.status(403).json({ message: "User not verified" });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user === "Wrong password") return res.status(400).json({ message: "Wrong password" });
  return res.status(201).json(user);
};
const logoutUsertController = async (req, res) => {
  const { _id: userId } = req.user;
  const user = await logoutUser(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(204).json({ message: "Logout successful" });
};
const getUsersController = async (req, res) => {
  const page = req.query.page || 1;
  const users = await getUsers(page);
  return res.status(200).json(users);
};

const getUserByIdController = async (req, res) => {
  const { userId } = req.params;
  const user = await getUserById(userId);
  if (!user) return res.status(404).json({ message: "No user with this id" });
  return res.status(200).json(user);
};

const getCurrentUserController = async (req, res) => {
  console.log(req.user);
  return res.status(200).json({ data: req.user });
};


const getUserByPhoneController = async (req, res) => {
  const { userPhone } = req.body;
  const user = await getUserByPhone(userPhone);
  if (!user) return res.status(404).json({ message: "No user with this phone" });
  return res.status(200).json(user);
};

const deleteUserByIdController = async (req, res) => {
  const { userId } = req.body;
  const deletedUser = await deleteUserById(userId);
  if (!deletedUser) return res.status(404).json({ message: "No user with this id" });
  return res
    .status(200)
    .json({ message: "User deleted successfully",  deletedUser });
};
const updateUserStatusController = async (req, res) => {
  const { userId, subscription } = req.body;
  const updatedUser = await updateUserStatus(userId, subscription);
  if (!updatedUser) return res.status(404).json({ message: "No user with this id" });
  return res
    .status(200)
    .json({ message: "User status updated successfully", updatedUser });
};

const addToAccessController = async (req, res) => {
  const { userId, storeId } = req.body;
  const updatedUser = await addToAccess(userId, storeId);
  if (updatedUser === "client")
    return res
      .status(403)
      .json({ message: "It is impossible to expand the rights of the client" });
  if (!updatedUser) return res.status(404).json({ message: "No user with this id" });
  return res.status(200).json({ message: "User rights are extended (if the user has the status of a seller, then the store has been replaced)", updatedUser });
};

const removeFromAccessController = async (req, res) => {
  const { userId, storeId } = req.body;
  const updatedUser = await removeFromAccess(userId, storeId);
  if (updatedUser === "client")
    return res
      .status(403)
      .json({ message: "It is impossible to expand the rights of the client" });
  if (!updatedUser) return res.status(404).json({ message: "No user with this id" });
  return res
    .status(200)
    .json({ message: "The store is no longer available to this user",updatedUser });
};

const updateUserStatisticsController = async (req, res) => {
  const { userId, resultOfCooperation } = req.body;
  const updatedUser = await updateUserStatistics(userId, resultOfCooperation);
  if (updatedUser === "not a client")
    return res
      .status(403)
      .json({ message: "Order statistics are relevant only for customers" });
  if (!updatedUser) return res.status(404).json({ message: "No user with this id" });

  return res.status(200).json({
    message: "Client stats updated",
    updatedUser,
  });
};

const updateUserInfoController = async (req, res) => {
  const { userId, name, seriesPassportNumber, email, phone } = req.body;
  const updatedUser = await updateUserInfo(
    userId,
    name,
    seriesPassportNumber,
    email,
    phone
  );
  if (!updatedUser) return res.status(404).json({ message: "No user with this id" });

  return res.status(200).json({
    message: "User updated successfully",
    updatedUser,
  });
};

const changePasswordRequestController = async (req, res) => {
  const { email } = req.body;
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const user = await changePasswordRequest(email, baseUrl);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user === "email err")
    return res.status(400).json({ message: "Message not sent, please try again." });
  return res.status(200).json({ mesage: "Letter with a temporary password to restore access has been successfully sent to your mail", user});
};

const changePasswordController = async (req, res) => {
  const { changePasswordToken } = req.params;
  const user = await changePassword(changePasswordToken);        
  if (!user) return res.status(404).json({ message: "Password recovery token is no longer active" });
  
  return res.status(200).json({
    mesage: "Password successfully changed to temporary",
    user,
  });
};

const userChengePasswordController = async (req, res) => {
  const { _id: userId, password } = req.user;
  const { newPassword, oldPassword } = req.body
  
  const updatedUser = await userChengePassword(newPassword, oldPassword, password, userId);
     if (updatedUser === "Wrong password")
       return res.status(400).json({ message: "Wrong password" });
  if (!updatedUser) return res.status(404).json({ message: "User not found" });
  

  return res.status(200).json({
    mesage: "Password successfully changed",
    user: updatedUser,
  });
};

module.exports = {
  createUserController,
  userVerificationCheckController,
  reVerificationController,
  loginUserController,
  logoutUsertController,
  getUsersController,
  getUserByIdController,
  getCurrentUserController,
  getUserByPhoneController,
  deleteUserByIdController,
  updateUserStatusController,
  addToAccessController,
  removeFromAccessController,
  updateUserStatisticsController,
  updateUserInfoController,
  changePasswordRequestController,
  changePasswordController,
  userChengePasswordController,
  
};
