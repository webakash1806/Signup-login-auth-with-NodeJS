const express = require('express')
const mongoose = require('mongoose')
const portConfig = require('./configs/port.config')
const dbConfig = require("./configs/db.config")
const User = require('./models/user.model')
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt')


const app = express()
app.use(bodyParser.json())

mongoose.connect(dbConfig.db_URL)
const db = mongoose.connection

db.on("error", () => {
    console.log("error")
})

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const protectedPassword = await bcrypt.hash(password, 8)
        const user = new User({ name, email, password: protectedPassword })

        await user.save()
        res.status(201).json({ message: "User Registered Successfully" })
    }
    catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed' })
    }
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const uniqueMail = await User.findOne({ email });

        if (uniqueMail) {
            const loginPassword = await bcrypt.compare(password, uniqueMail.password);

            if (loginPassword) {
                res.status(200).json({ message: "Success" });
            } else {
                res.status(401).json({ error: "Wrong password" });
            }
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});



app.listen(portConfig.PORT, () => {
    console.log("Server is successfully running at Port no:" + portConfig.PORT)
})