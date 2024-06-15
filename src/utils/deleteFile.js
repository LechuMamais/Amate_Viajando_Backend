const cloudinary = require('cloudinary').v2;

const deleteFile = async (url) => {
    try{

        const array = url.split('/');
        const name = array.at(-1).split('.')[0]
        
        const public_id = `${array.at(-2)}/${name}`;
        
        cloudinary.uploader.destroy(public_id, () => console.log('Imagen eliminada correctamente'))
    }catch(error){
        console.error('Error deleting file from Cloudinary:', error);
    }
}

module.exports = { deleteFile }