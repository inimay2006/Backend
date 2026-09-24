const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// ===============================
// MySQL Database Connection
// ===============================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


// Connect to MySQL
db.connect((err) => {

    if (err) {
        console.log("❌ MySQL connection failed");
        console.log(err.message);
        return;
    }

    console.log("✅ MySQL connected successfully");

});


// ===============================
// GET - Get all lost items
// ===============================

app.get("/api/items", (req, res) => {

    const sql = `
        SELECT *
        FROM lost_items
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log("Database error:", err.message);

            return res.status(500).json({
                message: "Database error"
            });
        }

        res.status(200).json(results);

    });

});


// ===============================
// GET - Get one item by ID
// ===============================

app.get("/api/items/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT *
        FROM lost_items
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {

            console.log("Database error:", err.message);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {

            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json(results[0]);

    });

});


// ===============================
// POST - Add lost item
// ===============================

app.post("/api/items", (req, res) => {

    const {
        itemName,
        category,
        description,
        lostLocation,
        lostDate,
        lostTime,
        identificationMarks,
        reportedBy,
        status
    } = req.body;


    // Basic validation
    if (
        !itemName ||
        !category ||
        !description ||
        !lostLocation ||
        !lostDate ||
        !reportedBy
    ) {

        return res.status(400).json({
            message: "Required fields are missing"
        });

    }


    const sql = `
        INSERT INTO lost_items
        (
            item_name,
            category,
            description,
            lost_location,
            lost_date,
            lost_time,
            identification_marks,
            reporter_name,
            reporter_role,
            department,
            roll_number,
            contact_number,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [

        itemName,

        category,

        description,

        lostLocation,

        lostDate,

        lostTime || null,

        identificationMarks || null,

        reportedBy.name,

        reportedBy.role,

        reportedBy.department,

        reportedBy.rollNumber || null,

        reportedBy.contactNumber,

        status || "lost"

    ];


    db.query(sql, values, (err, result) => {

        if (err) {

            console.log("Insert error:", err.message);

            return res.status(500).json({
                message: "Failed to store item"
            });

        }


        res.status(201).json({

            message: "Lost item stored successfully",

            item: {
                id: result.insertId,
                itemName,
                category,
                description,
                lostLocation,
                lostDate,
                lostTime,
                identificationMarks,
                reportedBy,
                status: status || "lost"
            }

        });

    });

});


// ===============================
// DELETE - Delete lost item
// ===============================

app.delete("/api/items/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM lost_items
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log("Delete error:", err.message);

            return res.status(500).json({
                message: "Failed to delete item"
            });

        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Item not found"
            });

        }

        res.status(200).json({
            message: "Item deleted successfully"
        });

    });

});


// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {

    console.log(
        `🚀 Server is running on http://localhost:${PORT}`
    );

});