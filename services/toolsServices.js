const { Tool } = require("../db/models/toolsModel");
const { Store } = require("../db/models/storesModel");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const ITEMS_PER_PAGE_TOOLS = 20;


const uploadToolPicture = async (file) => {
  console.log(file);
  return new Promise(((resolve, reject) => {
    let url = ''
   const cldUploadStream = cloudinary.uploader.upload_stream(
     {
       folder: "tools", // Папка, в которую загружается изображение
       public_id: file.originalname, // Оригинальное имя файла
       resource_type: "auto", // Тип ресурса (автоопределение)
       eager: [{ width: 195, height: 195, crop: "fill" }], // Опциональные манипуляции с изображением
     },
     function (error, result) {
       if (error) {
         reject(error);
         return undefined;
       } else {
         url = result.secure_url;
         console.log("URL загруженного изображения:", url);
         resolve(url);
       }
     }
   );
  
   streamifier.createReadStream(file.buffer).pipe(cldUploadStream);
  }))
};


const createTool = async (
  name,
  type,
  serialNumber,
  specifications,
  description,
  price,
  tags,
  toolPictureUrl,
  storeId,
  cityLocation
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
    cityLocation,
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
const getTools = async (page, storeId, type, tags, status, cityLocation) => {
  const skip = (page - 1) * ITEMS_PER_PAGE_TOOLS;
  const query = {};

 const tagsArr = JSON.parse(tags);

  if (storeId) query.storeId = storeId;
  if (type) query.type = type;
  if (tags && tags.length > 0) query.tags = { $all: tagsArr };
  if (status) query.status = status;
  if (cityLocation && cityLocation !== "Вся Україна") { query.cityLocation = cityLocation }

  return await Tool.find(query, "_id name type toolPicture status price")
    .skip(skip)
    .limit(ITEMS_PER_PAGE_TOOLS);
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

  const isPhotoUsed =  await Tool.findOne({
     toolPicture: fileUrl,
  });
  if(isPhotoUsed) return false

const matches = fileUrl.match(/\/([^/]+)\.\w+$/);
const publicId = matches ? matches[1] : null;

  const result = await cloudinary.api
    .delete_resources(`tools/${publicId}`, {
      type: "upload",
      resource_type: "image",
    })
    .then((response) => {
      const result = response.deleted[`tools/${publicId}`] === "deleted";
      return result;
    })
  return result;
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
  getTools,
  getToolById,
  deleteFileFromStorage,
  deleteTool,
  removeToolFromTheStore,
  updateToolInformation,
  getPictureUrlbyId,
  updatePictureTool,
  updateStoreTool,
};
