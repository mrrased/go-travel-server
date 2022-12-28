const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
const fileUpload = require('express-fileupload')


app.get('/', (req, res) => res.send('Go travel!'))


app.listen(port, () => console.log(`listening on port ${port}!`))