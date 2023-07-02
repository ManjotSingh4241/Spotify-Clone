var express = require("express");
var path = require("path");
var Initialize = require("./store-service.js");
var app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const upload = multer();
var storeService = require('./store-service.js');
const exphbs = require('express-handlebars');

cloudinary.config({ 
    cloud_name: 'dgow6motb', 
    api_key: '587784497122722', 
    api_secret: 'R6uU82F7R1FLpdhJ5Q2NPh_ksgI' 
  });

app.use(express.static('public/css'));

var HTTP_PORT = process.env.PORT || 8080;

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.engine('.hbs', exphbs.engine({ extname: '.hbs',
helpers: {
    navLink: function (url, options) {
      return (
        '<li calss="nav-item"><a ' +
        (url == app.locals.activeRoute ? ' class="nav-link active" ' : 'class="nav-link" ') +
        ' href="' +
        url +
        '">' +
        options.fn(this) +
        "</a></li>"
      );
    },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      
    },
}));
app.set('view engine', '.hbs');

app.listen(HTTP_PORT, () => {
    console.log(`Express http server listening on port ${HTTP_PORT}`);
});

app.get("/", function (req, res) {
    res.redirect("/shop");
});

app.get("/about", function (req, res) {
    res.render(path.join(__dirname + "/views/about.hbs"));
});



app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "post" objects
      let items = [];
  
      // if there's a "category" query, filter the returned posts by category
      if (req.query.category) {
        // Obtain the published "posts" by category
        items = await Initialize.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await Initialize.getPublishedItems();
      }
  
      // sort the published items by postDate
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
  
      // get the latest post from the front of the list (element 0)
      let post = items[0];
  
      // store the "items" and "post" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await Initialize.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  });


  app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
  
    try{
  
        // declare empty array to hold "item" objects
        let items = [];
  
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            items = await Initialize.getPublishedItemsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            items = await Initialize.getPublishedItems();
        }
  
        // sort the published items by postDate
        items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
  
        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
  
    }catch(err){
        viewData.message = "no results";
    }
  
    try{
        // Obtain the item by "id"
        viewData.item = await Initialize.getItemById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
  
    try{
        // Obtain the full list of "categories"
        let categories = await Initialize.getCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", {data: viewData})
  });

app.get("/items", function (req, res) {
    Initialize.getPublishedItems()
        .then((data) => {
            res.render("items", { items: data });
        })
        .catch((err) => {
            res.render("items", { message: "no results" });
        })  

});
app.get('/items/category/:Ct', (req, res) => {
    const category = req.params.Ct;
    storeService.getItemsByCategory(category)
        .then((items) => {
            if (items.length > 0) {
                res.json(items);
            } else {
                res.json({ message: "Error 404!" });
            }
        })
});

app.get("/items/minDate/:postDate", function (req, res) {
    const minDateStr = req.params.postDate;
  
    Initialize.getItemsByMinDate(minDateStr)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ error:"Error 404!" });
      });
  });
  
  
  
  app.get("/item/:id", function (req, res) {
    const itemId = parseInt(req.params.id);
  
    Initialize.getItemById(itemId)
      .then((item) => {
        res.json(item);
      })
      .catch((err) => {
        res.json({ error: err.message });
      });
  });
  


app.get("/categories", function (req, res) {
    Initialize.getCategories()
    .then((data) => {
        res.render("categories", { categories: data });
    })
    .catch((err) => {
        res.render("categories", { message: "no results" });
    }) 
});

app.get('/songs/add', (req, res) => {
    res.render(path.join(__dirname, "views", "addSongs.hbs"));
  });
  
app.post('/songs/add', upload.single("featureImage"), function (req, res, next) {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        // TODO: Process the req.body and add it as a new Item before redirecting to /items
        storeService.addItem(req.body)
            .then((newItem) => {
                res.redirect('/items');
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Failed to add item.');
            });

    }

})

app.use((req, res) => {
    res.status(404).render("404");
  });

Initialize.initialize()
    .then(() => {
        app.listen(HTTP_PORT, onHttpStart);
    })
    .catch(err => {
        console.log(err);
    })