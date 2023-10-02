const express = require("express");
const router = express.Router();

const { asyncWrapper } = require("../../helpers/apiHelpers");

const { authMiddleware } = require("../../middlewares/authMiddleware");

const {
  directorOrManagerAccessCheckMiddleware,
} = require("../../middlewares/directorOrManagerAccessCheckMiddleware");

const {
  createToolController,
  getToolsController,

  getToolByIdController,
  deleteToolController,
  updateInformationToolController,
  updatePictureToolController,
  updateStoreToolController,
} = require("../../controllers/toolsController");

router.post("/create", authMiddleware,directorOrManagerAccessCheckMiddleware, asyncWrapper(createToolController));


router.get("/", asyncWrapper(getToolsController));
router.get("/:toolId", asyncWrapper(getToolByIdController));


router.delete(
  "/remove/:toolId",
  authMiddleware,
  directorOrManagerAccessCheckMiddleware,
  asyncWrapper(deleteToolController)
);

router.patch(
  "/update/information/:toolId",
  authMiddleware,directorOrManagerAccessCheckMiddleware,
  asyncWrapper(updateInformationToolController)
);
router.patch(
  "/update/picture/:toolId",
  authMiddleware,
  directorOrManagerAccessCheckMiddleware,
  asyncWrapper(updatePictureToolController)
);
router.patch(
  "/update/store/:toolId",
  authMiddleware,
  directorOrManagerAccessCheckMiddleware,
  asyncWrapper(updateStoreToolController)
);

module.exports = router;
