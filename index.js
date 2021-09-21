const express = require('express')
const mongoose = require('mongoose')
const config = require('config')


const app = express()
const PORT = config.get('port') || 8000

app.use('/api/auth', require('./routes/auth.routes'))


async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: true,
        })
        app.listen(PORT, () => {
            console.log(`server has been started on port ${PORT}`)
        })
    } catch (err) {
        console.log('Server Error', err.message)
        process.exit(1)
    }
}

start()


