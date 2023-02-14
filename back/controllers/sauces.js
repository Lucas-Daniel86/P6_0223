//Importation du package 'fs' de node.js.
const fs = require('fs');

//Importation du model 'Sauce'.
const Sauce = require('../models/Sauce');

//Logique POST.
exports.createSauces = (req, res, next) => {
    const saucesObject = JSON.parse(req.body.sauce);
    delete saucesObject._id;
    const sauce = new Sauce({
        ...saucesObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    //La méthode save() enregistre l'objet dans mongoDB.
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

//Logique GET avec 'findOne'.
exports.getOneSauces = (req, res, next) => {

    //Pour accéder à l'id req.params.id.
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({ error });
        }
    );
};

//Logique PUT.
exports.modifySauces = (req, res, next) => {
    //Si on modifie le fichier image, récupérer le nom du fichier image sauce actuelle pour la suppréssion,
    //pour éviter d'avoir un fichier inutile dans le dossier images.
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split("/images")[1];

                //Suppression de l'image de la sauce car elle va être remplacée par la nouvelle image de sauce.
                fs.unlink(`images/${filename}`, (error) => {
                    if (err) throw err;
                })
            })
            .catch(error => res.status(400).json({ error }));
    }

    //L'objet qui va être envoyé dans la base de donnée.
    const saucesObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    //Update dans la base de donnée.
    Sauce.updateOne({ _id: req.params.id }, { ...saucesObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
        .catch((error) => res.status(404).json({ error }));
}

//Logique DELETE.
exports.deleteSauces = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];

            fs.unlink(`images/${filename}`, () => {

                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({ message: `l'Objet ${req.params.id} a été supprimé !` }) })
                    .catch((error) => res.status(401).json({ error }));
            });

        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

//Logique GET avec find.
exports.getAllSauces = (req, res, next) => {

    //Méthode 'find' pour avoir la liste complète.
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

//gestion des likes
exports.likeSauces = (req, res) => {
    const userId = req.body.userId;
    const sauceId = req.params.id;
    const likeState = req.body.like;

    switch (likeState) {
        //si like=1 on incrémente l'attribut likes de la sauce et on ajoute l'id de l'utilisateur dans le tableau usersLiked
        case 1:
            Sauce.updateOne({ _id: sauceId }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
                .then(() => res.status(200).json({ message: "Like ajouté à la sauce" }))
                .catch((error) => res.status(400).json({ error }));
            break;
        //si like=0 alors on étudie les deux tableaux usersLiked et usersDisliked et on mets à jour les attributs likes et dislikes ainsi que les tableaux eux meme selon la présence de l'userId dans l'un des deux
        case 0:
            //retourne le tableau correspondant a sauceId
            Sauce.findOne({ _id: sauceId })
                .then(sauce => {
                    if (sauce.usersLiked.includes(userId)) {
                        //décrémente l'attribut likes de la sauce et supprime l'userId du tableau usersLiked
                        Sauce.updateOne({ _id: sauceId }, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
                            .then(() => res.status(200).json({ message: "Vous avez enlever votre like !" }))
                            .catch(error => res.status(400).json({ error }));
                    } else if (sauce.usersDisliked.includes(userId)) {
                        //décrémente l'attribut dislikes de la sauce et supprime l'userId du tableau usersDisliked
                        Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
                            .then(() => res.status(200).json({ message: "Vous avez enlever votre dislike !" }))
                            .catch(error => res.status(400).json({ error }));
                    }
                })
                .catch(error => res.status(400).json({ error }));
            break;
        //si like=-1 on incrémente l'attribut dislikes de la sauce et on ajoute l'id de l'utilisateur dans le tableau usersDisliked
        case -1:
            Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
                .then(() => res.status(200).json({ message: "dislike ajouté à la sauce" }))
                .catch((error) => res.status(400).json({ error }));
            break;
    }
}