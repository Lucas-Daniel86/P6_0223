const fs = require('fs');

const Sauce = require('../models/Sauce');

//Logique POST.
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });
    sauce.save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
        .catch((error) => res.status(400).json({ error }));
};

//Logique GET.
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
};

//Logique PUT.
exports.modifySauce = (req, res, next) => {
    //Si l'image est modifiéé, récupérer le nom du fichier actuelle pour la suppréssion.
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                if (sauce.userId !== req.auth.userId) {
                    res.status(403).json({ error: 'Requête non authorisée' });
                } else {
                    //Récupération du nom de l'image à supprimer dans mongoDB.
                    const filename = sauce.imageUrl.split("/images")[1];
                    //Suppression de l'image de la sauce car elle va être remplacée par la nouvelle dans le dossier 'images' du serveur.
                    fs.unlink(`images/${filename}`, (error) => {
                        if (error) throw error;
                    })
                }
            })
            .catch(error => res.status(400).json({ error }));
    }
    //L'objet qui va être envoyé dans mongoDB.
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    //Update dans MongoDB.
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: "Sauce mise à jour" }))
        .catch((error) => res.status(404).json({ error }));
};

//Logique DELETE.
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (!sauce) {
                res.status(404).json({ error: 'Sauce non existante' });
            } else if (sauce.userId !== req.auth.userId) {
                res.status(403).json({ error: 'Requête non authorisée' });
            }
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: `La sauce ${req.params.id} a été supprimée !` }))
                    .catch((error) => res.status(404).json({ error }));
            });
        })
        .catch(error => { res.status(500).json({ error }) });
};

//Logique GET.
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => { res.status(200).json(sauces) })
        .catch(error => { res.status(400).json({ error }) });
};

//Gestion des likes.
exports.likeSauce = (req, res) => {
    const userId = req.body.userId;
    const sauceId = req.params.id;
    const likeState = req.body.like;

    switch (likeState) {
        //Si like=1 : Incrémenter l'attribut 'likes' de la sauce et ajouter l'id de l'utilisateur dans le tableau 'usersLiked'.
        case 1:
            Sauce.updateOne({ _id: sauceId }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
                .then(() => res.status(200).json({ message: "Like ajouté à la sauce" }))
                .catch((error) => res.status(400).json({ error }));
            break;
        //Si like=0 : Vérifier 'usersLiked' et 'usersDisliked' et mettre à jour les attributs 'likes' et 'dislikes' ainsi que les tableaux eux meme selon la présence de l'userId.
        case 0:
            Sauce.findOne({ _id: sauceId })
                .then(sauce => {
                    if (sauce.usersLiked.includes(userId)) {
                        //Décrémente l'attribut 'likes' de la sauce et supprime l'userId du tableau 'usersLiked'
                        Sauce.updateOne({ _id: sauceId }, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
                            .then(() => res.status(200).json({ message: "Vous avez enlevé votre like !" }))
                            .catch(error => res.status(400).json({ error }));
                    } else if (sauce.usersDisliked.includes(userId)) {
                        //Décrémente l'attribut 'dislikes' de la sauce et supprime l'userId du tableau 'usersDisliked'
                        Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
                            .then(() => res.status(200).json({ message: "Vous avez enlevé votre dislike !" }))
                            .catch(error => res.status(400).json({ error }));
                    }
                })
                .catch(error => res.status(400).json({ error }));
            break;
        //Si like=-1 : Incrémenter l'attribut 'dislikes' de la sauce et ajouter l'id de l'utilisateur dans le tableau 'usersDisliked.
        case -1:
            Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
                .then(() => res.status(200).json({ message: "Dislike ajouté à la sauce" }))
                .catch((error) => res.status(400).json({ error }));
            break;
    }
}