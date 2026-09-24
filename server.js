const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

// Temporary storage
let items = [];

// GET API - Get all items
app.get("/api/items", (req, res) => {
    res.json(items);
});

// POST API - Store an item
app.post("/api/items", (req, res) => {
    const { itemName, location, description, type } = req.body;

    const newItem = {
        id: items.length + 1,
        itemName,
        location,
        description,
        type
    };

    items.push(newItem);

    res.status(201).json({
        message: "Item stored successfully",
        item: newItem
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});