const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const multer = require("multer");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const { errorHandler } = require("./helpers/apiHelpers");
const  contactsRouter  = require("./routes/api/contacts");
const  usersRouter  = require("./routes/api/users");
const toolsRouter = require("./routes/api/tools")
const ordersRouter = require("./routes/api/orders")
const storesRouter = require("./routes/api/stores");

const upload = multer();
const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
app.use(upload.none());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/contacts', contactsRouter)
app.use("/api/users", usersRouter);
app.use("/api/tools", toolsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/stores", storesRouter);
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})


module.exports = app
