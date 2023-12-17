const express = require("express");
const parser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine","ejs");
app.use(parser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://akankshawattamwar4:Abw%402408%2EmongoDB@cluster0.8sbkcl2.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema ={
    name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name: "Welcome to your To-Do List"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<-- Hit this button to delete an item"
});


const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    Item.find({}).then((data) =>{
        if(data.length === 0) {
            Item.insertMany(defaultItems);
        }
        else{
            res.render("list", {ListTitle: "Today",NewItem: data,});
        }
    });
});

app.get("/:customListName",function(req,res){
        const ListName = _.capitalize(req.params.customListName);
        List.findOne({name:ListName}).then((data) =>{
            if(!data){
                const list = new List({
                        name: ListName,
                        items: defaultItems
                });
                list.save();
                res.redirect("/"+ListName);
            }else{
                res.render("list",{ListTitle: data.name ,NewItem: data.items,})
            }
        });
});



app.post("/",function(req,res){
   const itemName = req.body.Todo;
   const listName = req.body.list;
   const item = new Item({
        name: itemName
   });

   if(listName=="Today"){
    item.save();
    res.redirect("/");
   }else{
        List.findOne({name:listName}).then((data) =>{
            data.items.push(item);
            data.save();
            res.redirect("/"+ listName);
        });
   }
   
});

app.post("/delete",function(req,res){
    const id = req.body.check;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.deleteOne({_id:id}).then(function(){
            console.log("Blog deleted"); // Success
         }).catch(function(error){
            console.log(error); // Failure
         });
     
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items: {_id:id}}}).then(function(){
            console.log("Blog deleted"); // Success
         }).catch(function(error){
            console.log(error); // Failure
         });
        res.redirect("/" + listName);
    }

    
});


app.listen(process.env.PORT || 3000,function(){
console.log("Server is up.");
});


//deleteOne needs callback function to delete the document
//res.sendFile(__dirname +"/index.html");
