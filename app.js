const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {
    restart
} = require('nodemon');

const _ = require("lodash");
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
})) 
app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect("mongodb+srv://admin-sudan:onevoice123@cluster0.s4syznv.mongodb.net/todolistDB");

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
    name: 'Welcome to my todo list',
});
const item2 = new Item({
    name: 'Click + to add ',
});
const item3 = new Item({
    name: 'Click the checkbox to delete',
});

const defItems = [item1, item2, item3];

const listSchema = {
    name : String,
    items : [itemSchema] 
};

const List = mongoose.model("List",listSchema);


// Item.deleteMany({name : 'Welcome to my todo list'},function(err){
//     if (err){
//         console.log(err)
//     }else{
//         console.log("Deleted")
//     }
// })

var options = {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
}
var date = new Date();
var today = date.toLocaleDateString("en-US", options);


app.get("/", function (req, res) {

    Item.find({}, function (err, items) {
        if (items.length === 0) {
            Item.insertMany(defItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted default items");
                }
            })
            res.redirect("/");
        } else {
            res.render('index', {
                title: today,
                newlist: items
            });
        }
    });



})

app.post("/", function (req, res) {
    var item = req.body.item;   
    var listName = req.body.list;   
    const newItem = new Item({
        name : item
    })
    if (listName === today.split(" ")[0]){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function (err,result){
            result.items.push(newItem);
            result.save();
            res.redirect("/"+listName);
        })
    }


    

})

app.post("/delete",function(req,res){
    const checked = req.body.checkbox;
    const listName = req.body.liname;
    if (listName === today){
    Item.findByIdAndRemove(checked,function(err){
        if (err){
            console.log(err);
        }
        else{
            console.log("Succesfully deleted");
            res.redirect("/");
        }
    })
    } else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked}}},function(err,result){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
})

app.get("/:userlist",function(req,res){
    const userparams = _.capitalize(req.params.userlist);
    List.findOne({name:userparams},function(err,result){
        if (!err){
            if (!result){
                const list = new List({
                    name : userparams,
                    items : defItems
                });
                list.save();
                res.redirect("/"+userparams )
            }
            else{
                res.render("index",{title:result.name , newlist:result.items})
            }
        }
        else{
            console.log(err);
        }
    })
  
})

app.get("/work", function (req, res) {
    res.render('index', {
        title: "Work",
        newlist: workItems
    });
})


app.listen(process.env.PORT || 3000, function () {
    console.log("Server started at port 3000");
})