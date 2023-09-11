const { Tool } = require("../db/models/toolsModel");
const { Store } = require("../db/models/storesModel");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const { Readable } = require("stream");

const ITEMS_PER_PAGE_TOOLS = 20;


const uploadToolPicture = async (file, originalname) => {
    const destFileName = `tools/${originalname}`;
    const fileOptions = {
      metadata: {
        contentType: "image/png",
        cacheControl: "public, max-age=3600",
        acl: [{ entity: "allUsers", role: "READER" }],
      },
    };

    const bucket = storage.bucket("toolslemaev");
    const fileStream = bucket.file(destFileName).createWriteStream(fileOptions);

    const fileReadStream = new Readable();
    fileReadStream.push(file.buffer);
    fileReadStream.push(null); // Завершение потока

    // Передача потока файла напрямую из клиента в хранилище
    fileReadStream.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => {
        reject(error);
      });

      fileStream.on("finish", () => {
        const url = `https://storage.googleapis.com/toolslemaev/${destFileName}`;
        resolve(url);
      });
    });
};
// new mongoose.Types.ObjectId(userId);

const createTool = async (
  name,
  type,
  serialNumber,
  specifications,
  description,
  price,
  tags,
  toolPictureUrl,
  storeId
) => {
  return await Tool.create({
    name,
    type,
    serialNumber,
    specifications,
    description,
    price,
    tags,
    toolPicture: toolPictureUrl,
    storeId,
  });
};

const addToolToTheStore = async (storeId, toolId) => {
  const store = await Store.findById(storeId);
  if (!store) return null;
  return await Store.findOneAndUpdate(
    { _id: storeId },
    { $addToSet: { tools: toolId } },
    { new: true }
  );
};
const getAllTools = async (page) => {
  const skip = (page -1) * ITEMS_PER_PAGE_TOOLS

  return await Tool.find({}, "_id name type toolPicture status price").skip(skip).limit(ITEMS_PER_PAGE_TOOLS);
};
const getToolByStore = async (storeId, page) => {
  const skip = (page -1) * ITEMS_PER_PAGE_TOOLS
  return await Tool.find({ storeId }, "_id name type toolPicture status price").skip(skip).limit(ITEMS_PER_PAGE_TOOLS);
};

const getToolByType = async (type, page) => {
  const skip = (page -1) * ITEMS_PER_PAGE_TOOLS
  return await Tool.find({ type }, "_id name type toolPicture status price").skip(skip).limit(ITEMS_PER_PAGE_TOOLS);
};

const getToolById = async (toolId) => {
  return await Tool.findOne({_id: toolId });
};

const deleteTool = async (toolId) => {
  return await Tool.findByIdAndDelete(toolId);
};

const removeToolFromTheStore = async (storeId, toolId) => {
  return await Store.findOneAndUpdate(
    { _id: storeId },
    { $pull: { tools: toolId } },
    { new: true }
  );
};

const deleteFileFromStorage = async (fileUrl) => {
  const filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
  try {
    await storage.bucket("toolslemaev").file(`tools/${filename}`).delete();
    return true; 
  } catch (error) {
    console.error("Error deleting file:", error);
    return false; 
  }
};


const updateToolInformation = async (
  toolId,
  name,
  type,
  serialNumber,
  specifications,
  description,
  price,
  tags
) => {
  return await Tool.findOneAndUpdate(
    { _id: toolId },
    {
      $set: {
        name,
        type,
        serialNumber,
        specifications,
        description,
        price,
        tags,
      },
    },
    { new: true }
  );
};

const getPictureUrlbyId = async (toolId) => {
  const tool = await Tool.findOne({ _id: toolId });
  if(!tool) return null
  return tool.toolPicture;
};

const updatePictureTool = async (toolId, newToolPictureUrl) => {
  return await Tool.findOneAndUpdate(
    { _id: toolId },
    { $set: { toolPicture: newToolPictureUrl } },
    { new: true }
  );
};

const updateStoreTool = async (storeId, toolId) => {
  return await Tool.findOneAndUpdate(
    { _id: toolId },
    { $set: { storeId } },
    { new: true }
  );
};




module.exports = {
  uploadToolPicture,
  createTool,
  addToolToTheStore,
  getAllTools,
  getToolByStore,
  getToolByType,
  getToolById,
  deleteFileFromStorage,
  deleteTool,
  removeToolFromTheStore,
  updateToolInformation,
getPictureUrlbyId,
  updatePictureTool,
  updateStoreTool,
};
