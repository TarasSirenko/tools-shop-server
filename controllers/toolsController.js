
const {
  uploadToolPicture,
  createTool,
  addToolToTheStore,
  getTools,
  // getToolByStore,
  // getToolByType,
  getToolById,
  deleteFileFromStorage,
  deleteTool,
  removeToolFromTheStore,
  updateToolInformation,
  getPictureUrlbyId,
  updateStoreTool,
  updatePictureTool,
} = require("../services/toolsServices");

const createToolController = async (req, res) => {
    console.log(req.body.data);
  const toolInfo = JSON.parse(req.body.data);
  console.log(toolInfo);
  const {
    name,
    type,
    serialNumber,
    specifications,
    description,
    price,
    tags,
    storeId,
    cityLocation,
  } = toolInfo;
 
  const toolPictureUrl = await uploadToolPicture(req.files[0]);
 

  if (!toolPictureUrl) return res.status(404).json("Failed to load image");
  const newTool = await createTool(
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
  );
  
  const updatedStore = await addToolToTheStore(storeId, newTool._id);
  if (!updatedStore) return res.status(404).json("No store with this id");

  return res.status(200).json(newTool);
};

const getToolsController = async (req, res) => {
  const page = req.query.page || 1;
  const { storeId, type, tags, status, city } = req.query;

   const tools = await getTools(page, storeId, type, tags, status, city); 

  if (tools.length === 0) return res.status(404).json("Tool not found");
  return res.status(200).json({ data: tools, currentPage: page });
};

const getToolByIdController = async (req, res) => {
  const { toolId } = req.query;
  const tool = await getToolById(toolId);
  if (tool.length === 0) return res.status(404).json("Tool not found");
  return res.status(200).json(tool);
};

const deleteToolController = async (req, res) => {
  const { toolId } = req.params;
  
  const deletedTool = await deleteTool(toolId);
  if (!deletedTool) return res.status(404).json({ message: "Tool not found" });

  const updatedStore = await removeToolFromTheStore(
    deletedTool.storeId,
    deletedTool._id
  );
  if (!updatedStore) return res.status(404).json("No store with this id");

  
   const result = await deleteFileFromStorage(deletedTool.toolPicture);
   if (result) {
     console.log("File deleted successfully");
   } else {
     console.log("Error deleting file");
   }


  return res.status(200).json("Tool removed successfully");
};

const updateInformationToolController = async (req, res) => {
  const { toolId } = req.params;
  const { name, type, serialNumber, specifications, description, price, tags } =
    req.body;

  const updatedTool = await updateToolInformation(
    toolId,
    name,
    type,
    serialNumber,
    specifications,
    description,
    price,
    tags
  );
  if (!updatedTool) return res.status(404).json({ message: "Tool not found" });
  return res.status(200).json(updatedTool);
};


const updatePictureToolController = async (req, res) => {
  const { toolId } = req.params;

  const oldPictureUrl = await getPictureUrlbyId(toolId);
  if(!oldPictureUrl)res.status(404).json("Tool not found");
  const result = await deleteFileFromStorage(oldPictureUrl);
    if (result) {
      console.log("File deleted successfully");
    } else {
      console.log("Error deleting file");
    }

 const newToolPictureUrl = await uploadToolPicture(req.files[0]);
  if (!newToolPictureUrl) return res.status(404).json("Failed to load image");

  const updatedTool = await updatePictureTool(toolId, newToolPictureUrl);
  return res.status(200).json(updatedTool);
};

const updateStoreToolController = async (req, res) => {
  const { toolId } = req.params;
  const { oldStoreId, newStoreId } = req.body;

  const updatedTool = await updateStoreTool(newStoreId, toolId);
  if (!updatedTool) return res.status(404).json({ message: "Tool not found" });
  const updatedStore = await addToolToTheStore(newStoreId, toolId);
    const oldStore = await removeToolFromTheStore(oldStoreId, toolId);
    if (!oldStore) return res.status(404).json("No store with this id");
    if (!updatedStore) return res.status(404).json("No store with this id");
  return res.status(200).json(updatedTool);
};





module.exports = {
  createToolController,
  getToolsController,
  // getToolByStoreController,
  // getToolByTypeController,
  getToolByIdController,
  deleteToolController,
  updateInformationToolController,
  updatePictureToolController,
  updateStoreToolController,
};
