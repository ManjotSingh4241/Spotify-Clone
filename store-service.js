const fs = require("fs");

var items = [];
var categories = [];

module.exports.initialize = function () {

    var promise = new Promise((resolve, reject) => {
        fs.readFile('./data/categories.json', (err, data) => {
            if (err) throw err;

            categories = JSON.parse(data);
        });
        fs.readFile('./data/items.json', (err, data) => {
            if (err) throw err;

            items = JSON.parse(data);
        });
    })
    return promise;
};

module.exports.getAllItems = function () {

    var promise = new Promise((resolve, reject) => {
        if (items.length === 0) {
            var err = "Data fetch Error!";
            reject({ message: err });
        }

        resolve(items);
    })
    return promise;
};

module.exports.getPublishedItems = function () {
    var publi = [];
    var promise = new Promise((resolve, reject) => {

        for (var i = 0; i < items.length; i++) {
            if (items[i].published == true) {
                publi.push(items[i]);
            }
        }
        if (publi.length === 0) {
            var err = "Data fetch Error!";
            reject({ message: err });
        }
        resolve(publi);
    })
    return promise;
};

module.exports.getPublishedItemsByCategory = function (category) {
    var publi = [];
    var promise = new Promise((resolve, reject) => {
        for (var i = 0; i < items.length; i++) {
            if (items[i].published == true && items[i].category == category) {
                publi.push(items[i]);
            }
        }
        if (publi.length === 0) {
            var err = "No Data";
            reject({ message: err });
        }
        resolve(publi);
    });
    return promise;
};


module.exports.getCategories = function () {

    var promise = new Promise((resolve, reject) => {

        if (categories.length === 0) {
            var err = "Data fetch Error!";
            reject({ message: err });
        }
        resolve(categories);
    })
    return promise;
};

module.exports.addItem = function (itemData) {
    itemData.published = itemData.published === undefined ? false : true;
    itemData.id = items.length + 1;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    itemData.postDate = `${year}-${month}-${day}`;

    items.push(itemData);

    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject('Error 404!');
        } else {
            resolve(items);
        }
    });
};


exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        var cat = items.filter(item => item.category == category);
        if (cat.length == 0) {
            reject({ message: "No result returned" });
        }
        resolve(cat);
    })
};

module.exports.getItemsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const MD = items.filter((item) => new Date(item.postDate) >= new Date(minDateStr));

        if (MD.length > 0) {
            resolve(MD);
        } else {
            reject({ message: "No result returned" });
        }
    });
};

module.exports.getItemById = function (id) {
    return new Promise((resolve, reject) => {
        const item = items.find((item) => item.id === id);

        if (item) {
            resolve(item);
        } else {
            reject({ message: "No result returned" });
        }
    });
};