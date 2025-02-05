import express from "express"
import cors from "cors"
import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Routes
app.post("/api/save-form", async (req, res) => {
  try {
    const { formData, checklistItems, documentationItems } = req.body

    const connection = await pool.getConnection()

    // Save form data
    const [formResult] = await connection.query(
      "INSERT INTO forms (empresa, area, data, hora, executado_por) VALUES (?, ?, ?, ?, ?)",
      [formData.empresa, formData.area, formData.data, formData.hora, formData.executadoPor],
    )
    const formId = (formResult as any).insertId

    // Save checklist items
    for (const item of checklistItems) {
      await connection.query(
        "INSERT INTO checklist_items (form_id, standard, description, condition, fe, nper, photo, audio, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          formId,
          item.standard,
          item.description,
          item.condition,
          item.fe,
          item.nper,
          item.photo,
          item.audio,
          item.comment,
        ],
      )
    }

    // Save documentation items
    for (const item of documentationItems) {
      await connection.query(
        "INSERT INTO documentation_items (form_id, standard, description, condition, photo, audio, pdf, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [formId, item.standard, item.description, item.condition, item.photo, item.audio, item.pdf, item.comment],
      )
    }

    connection.release()

    res.status(201).json({ message: "Form saved successfully", formId })
  } catch (error) {
    console.error("Error saving form:", error)
    res.status(500).json({ message: "Error saving form" })
  }
})

app.get("/api/get-form/:id", async (req, res) => {
  try {
    const formId = req.params.id
    const connection = await pool.getConnection()

    // Get form data
    const [formRows] = await connection.query("SELECT * FROM forms WHERE id = ?", [formId])
    const formData = formRows[0]

    // Get checklist items
    const [checklistRows] = await connection.query("SELECT * FROM checklist_items WHERE form_id = ?", [formId])

    // Get documentation items
    const [documentationRows] = await connection.query("SELECT * FROM documentation_items WHERE form_id = ?", [formId])

    connection.release()

    res.json({
      formData,
      checklistItems: checklistRows,
      documentationItems: documentationRows,
    })
  } catch (error) {
    console.error("Error retrieving form:", error)
    res.status(500).json({ message: "Error retrieving form" })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

