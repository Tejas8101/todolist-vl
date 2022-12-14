const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/app1.js");

// console.log(date());
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const pencil = new Item({
  name: "Pencil"
});

const pen = new Item({
  name: "Pen"
});

const rubber = new Item({
  name: "Rubber"
});

const defaultItems = [pencil, pen, rubber];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res){


  Item.find({}, function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else{
          console.log("Successfully saved default items to array");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle: "Today", newListItems: foundItems});
    }

  });


});

app.post("/", function(req,res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

   const item = new Item({
     name: itemName
   });

   if(listName === "Today"){
     item.save();

     res.redirect("/");
   } else{
     List.findOne({name: listName}, function(err, foundList){
       foundList.items.push(item);
       foundList.save();
       res.redirect("/"+listName);
     })
   }

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+ customListName);
      } else{
        //show an existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName=== "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/");
      };
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }


})

// app.get("/work",function(req,res){
//   res.render("list",{listTitle: "Work Title", newListItems: workItems});
// });
//
// app.post("/work",function(req,res){
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// })
//
// app.get("/about",function(req,res){
//   res.render("about");
// })

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
