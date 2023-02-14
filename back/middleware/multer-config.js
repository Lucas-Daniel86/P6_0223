//multer: Pour gérer les requêtes HTTP avec envoie de fichier.
//Importation du package multer.
const multer = require('multer');

//Dictionnaire de MIME_TYPES.
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif'
};

//Répertoire du fichier.
//Générer un nom de fichier unique.
const storage = multer.diskStorage({
    //Destination stockage du fichier.
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {

        //Supprimer les espaces dans le nom du fichier.
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

//Exportation du middleware multer.
module.exports = multer({ storage: storage }).single('image');