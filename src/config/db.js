const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("Conectado a MongoDB");

    }catch(e){
        console.log("Error al conectar a MongoDB", e);
    }
}

module.exports = { connectDB }