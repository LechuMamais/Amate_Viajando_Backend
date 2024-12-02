require("dotenv").config();
const express = require('express');
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const { connectDB } = require("./src/config/db");
const usersRouter = require("./src/api/routes/users");
const destinationsRouter = require("./src/api/routes/destinations");
const toursRouter = require("./src/api/routes/tours");
const imagesRouter = require("./src/api/routes/images");
const articlesRouter = require("./src/api/routes/articles");
const { connectCloudinary } = require("./src/config/cloudinary");

const app = express();

// Inicializar la aplicación Express
connectDB();
// Conectar a Cloudinary
connectCloudinary()
// Configuracion para poder utilizar formato json
app.use(express.json());
// Middleware CORS
app.use(cors());

// Definición de las rutas del API
app.use("/api/v1/destinations", destinationsRouter);
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/images", imagesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/articles", articlesRouter);

app.use("*", (req, res, next) => {
    return res.status(404).json("404 - Route Not Found");
});

// Escuchar en el puerto PORT definido en .env, o por default 3000
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
