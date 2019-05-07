// jshint esversion:6

const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const _          = require('lodash');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// const items = ['Buy food', 'Cook food', 'Eat food'];
// const workItems = ['Clean house', 'Call mom', 'Break window'];

// Connect to Mongoose *********************************
mongoose.connect('mongodb+srv://*****-******:********@cluster0-ldsjd.mongodb.net/todolistDB', {useFindAndModify: false,useNewUrlParser: true});

// Create Mongoose schema *********************************
const itemsSchema = new mongoose.Schema ({
    name: {type: String, required: "WTF??? ...where is the NAME???....ASSHOLE!!!"}
  });

const listSchema = new mongoose.Schema ({
  name: {type: String, required: "WTF??? ...where is the NAME???....ASSHOLE!!!"},
  items: [itemsSchema]
});

// Create Mongoose model *********************************
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

// List of items *********************************
const item1 = new Item({ name: "Buy food"});
const item2 = new Item({ name: "Cook food"});
const item3 = new Item({ name: "Eat food"});

const defaultItems = [item1, item2, item3];



// Routes *****************************************

app.get('/', (req, res) => {

Item.find({}, (err, foundItems) => {

// inserting default Items 
  if (foundItems.length === 0) {

    Item.insertMany(defaultItems, err => {
      if(err) {
        console.log(err);
      } else {
        console.log("Succesfully saved all the default items to the items table");
      }
   });

  res.redirect("/");
  
  } else {
    res.render('list', {listTitle: "Today", newListItems: foundItems});
  }
  });  
});

app.get("/favicon.ico", function(req, res){
  res.sendStatus(204);
});

app.get('/:customListName', (req, res) => {
  
  let customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList) => {

    if (!err) {

      if (foundList) {

        res.render('list', {listTitle: customListName, newListItems: foundList.items });

      } else {

        const newList = new List({ name: customListName, items: defaultItems});

        newList.save();

        res.redirect('/' + customListName);

      }

    }

  });
  
});

app.post('/', (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({name: itemName});

  if (listName === "Today") {

    item.save();
    res.redirect('/'); 

  } else {

    List.findOne({name: listName}, (err, foundList) => {

      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);

    });

  }

       

});

app.post('/delete', (req, res) => {

  const item2Delete = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    Item.findByIdAndRemove(item2Delete, function (err) {

      if (err) {
  
        console.log(err);
  
      } else {
  
        res.redirect('/');
  
      }
  
    });

  } else {

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: item2Delete}}}, (err, foundList) => {

      if (!err) {

          res.redirect('/' + listName);


      } else {

        console.log("Delete item faild: " + err);

      }

    });

  }

  

});

app.get('/about', (req, res) => res.render('about'));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => console.log('Server has started succesfully!'));