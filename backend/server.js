require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Generic Data API Facade
// This assumes the frontend sends body: { collection, database, dataSource, filter, document, update, ... }
// We only care about 'collection' and the action parameters.

const getModel = (collectionName) => {
  // Use existing model if defined, or create a generic mixed model
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  // Generic Schema for schemaless flexibility matching Data API behavior
  return mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
};

// --- Action Handlers ---

app.post('/action/findOne', async (req, res) => {
  try {
    const { collection, filter } = req.body;
    const model = getModel(collection);
    
    // Convert $oid to ObjectId if present
    const cleanFilter = parseFilter(filter);
    
    const document = await model.findOne(cleanFilter);
    res.json({ document });
  } catch (error) {
    console.error('findOne error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/action/find', async (req, res) => {
  try {
    const { collection, filter, sort, limit } = req.body;
    const model = getModel(collection);
    
    const cleanFilter = parseFilter(filter);
    
    let query = model.find(cleanFilter);
    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    
    const documents = await query.exec();
    res.json({ documents });
  } catch (error) {
    console.error('find error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/action/insertOne', async (req, res) => {
  try {
    const { collection, document } = req.body;
    const model = getModel(collection);
    
    const result = await model.create(document);
    res.json({ insertedId: result._id });
  } catch (error) {
     console.error('insertOne error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/action/updateOne', async (req, res) => {
  try {
    const { collection, filter, update } = req.body;
    const model = getModel(collection);
    
    const cleanFilter = parseFilter(filter);
    
    const result = await model.updateOne(cleanFilter, update);
    res.json({ 
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
     console.error('updateOne error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to handle EJSON-like extensions used in frontend (e.g. $oid)
function parseFilter(filter) {
  if (!filter) return {};
  const newFilter = { ...filter };
  
  // Basic recursive check for $oid - in a real app use ejson library or more robust recursion
  for (const key in newFilter) {
    if (newFilter[key] && typeof newFilter[key] === 'object') {
       if (newFilter[key].$oid) {
         newFilter[key] = new mongoose.Types.ObjectId(newFilter[key].$oid);
       } else {
         newFilter[key] = parseFilter(newFilter[key]);
       }
    }
  }
  return newFilter;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend facade listening on port ${PORT}`);
});
