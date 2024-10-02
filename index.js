const express = require('express');
const cors = require("cors");
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const dbname = "homerentcare"; // CHANGE THIS TO YOUR ACTUAL DATABASE NAME
const mongoUri = process.env.MONGO_URI;

// !! Enable processing JSON data
let app = express();

// !! Enable CORS
app.use(cors());

async function connect(uri, dbname) {
    let client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    })
    _db = client.db(dbname);
    return _db;
}





async function main() {
        let db = await connect(mongoUri, dbname);
    

// add routes here
app.get('/', function(req,res){
    res.json({
       "message":"hello world"
    });
})


app.get("/userdetail", async (req,res) => {
        try {
            const userdetail = await db.collection("userdetail").find().project(
                {   "_id": 1,
                    "type": 1,
                    "fullname": 1,
                    "contactnumber": 1,
                    "emailaddress": 1,
                    "propertyid": 1
                  }).toArray();
            
            res.json({ userdetail });
        } catch (error) {
            console.error("Error fetching userdetail:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

//app.get("/propertydetail", async (req,res) => {
//        try {
//            const propertydetail = await db.collection("propertydetail").find().project(
 //                 {
 //                   "_id": 1,
  //                  "propertyid": 1,
  //                  "nameofProperty": 1,
  //                  "homeownerFullname": 1,
  //                  "address": 1,
 //                   "postalcode": 1,
 //                   "numberofBedrooms": 1,
 //                   "numberofBathrooms": 1,
 //                   "carparkLots": 1,
 //                   "amenities": 1,
 //                 }).toArray();
  //          
 //           res.json({ propertydetail });
 //       } catch (error) {
 //           console.error("Error fetching propertydetail:", error);
  //          res.status(500).json({ error: "Internal server error" });
   //     }
  //  });

    const { ObjectId } = require('mongodb');

    app.get("/userdetail/:id", async (req, res) => {
        try {
            const id = req.params.id;
            
            // First, fetch the userdetail
            const userdetail = await db.collection("userdetail").findOne(
                { _id: new ObjectId(id) },
                { projection: { _id: 0 } }
            );
            
            if (!userdetail) {
                return res.status(404).json({ error: "User not found" });
            }
            
            res.json(userdetail);
        } catch (error) {
            console.error("Error fetching user details:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

   // const { ObjectId } = require('mongodb');

app.get("/propertydetail/:id", async (req, res) => {
    try {
        const id = req.params.id;
        
        // First, fetch the recipe
        const propertydetail = await db.collection("propertydetail").findOne(
            { _id: new ObjectId(id) },
            { projection: { _id: 0 } }
        );
        
        if (!propertydetail) {
            return res.status(404).json({ error: "propertydetail not found" });
        }

        res.json(propertydetail);
    } catch (error) {
        console.error("Error fetching property details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/propertydetail", async function(req,res){
    try {

        // this is the same as let tags = req.query.tags etc. etc.
        // syntax: object destructuring
        //let {tags, cuisine, ingredients, name} = req.query;
        let {numberofBedrooms, numberofBathrooms, amenities, nameofProperty} = req.query;

        let criteria = {};

        if (numberofBedrooms) {
            criteria["numberofBedrooms"] = {
               "$regex": numberofBedrooms, "$options":"i"
            }
        }

        if (numberofBathrooms) {
            criteria["numberofBathrooms"] = {
                 "$regex": numberofBathrooms, "$options":"i"
                }
            }
        

        if (amenities) {
            criteria["amenities"] = {
                 "$regex": amenities, "$options":"i"
                 //"$in": amenities.split(",")
                 //"$in": amenities.split(",").map(function(i){
                    // case-in sensiitve search
                   //return new RegExp(i, 'i');
                }
            }
            
        
        if (nameofProperty) {
                criteria["nameofProperty"] = {
                    "$regex": nameofProperty, "$options":"i"
                }
            }


        // mongo shell: db.recipes.find({},{name:1, cuisine:1, tags:1, prepTime:1})
        let propertydetail = await db.collection("propertydetail").find(criteria)
            .project({
                "propertyid": 1,
                "nameofProperty": 1,
                "postalcode": 1,
                "numberofBedrooms": 1,
                "numberofBathrooms": 1,
                "amenities": 1
            }).toArray();
        res.json({
            'propertydetail' : propertydetail
        })
    } catch (error) {
        console.error("Error fetching property details:", error);
        res.status(500);
    }
});

app.post('/propertydetail', async (req, res) => {
    try {
        const { _id, propertyid, nameofProperty, homeownerFullname, address, postalcode, numberofBedrooms, numberofBathrooms, carparkLots, amenities } = req.body;

        // Basic validation
        if (!nameofProperty || !numberofBathrooms || !numberofBedrooms || !amenities) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Fetch the propertydetail document
        const propertydetailDoc = await db.collection('propertydetail').findOne({ propertydetail: propertydetail });
        if (!propertydetailDoc) {
            return res.status(400).json({ error: 'Invalid Property Detail' });
        }

        // find the _id of the related cuisine and add it to the new recipe
        //    let cuisineDoc = await db.collection('cuisine').findOne({
        //        "name": cuisine
         //   })
//
         //   if (!cuisineDoc) {
         //       return res.status(400).json({"error":"Cuisine not found"})
          //  }

        // Create the new propertydetail object
        const newpropertydetail = {
            _id,
            propertyid,
            nameofProperty,
            homeownerFullname,
            address,
            postalcode,
            numberofBedrooms,
            numberofBathrooms,
            carparkLots,
            amenities
        };

        // Insert the new recipe into the database
        const result = await db.collection('propertydetail').insertOne(newpropertydetail);

        // Send back the created recipe
        res.status(201).json({
            message: 'Property detail created successfully',
            propertydetailId: result.insertedId
        });
    } catch (error) {
        console.error('Error creating property detail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

}
    
    
    main();


app.listen(3000, ()=>{
    console.log("Server started")
})

