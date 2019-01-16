const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const validate = require('./middleware/validate')

const routes = require('./routes/index')
const entries = require('./routes/entries')
const users = require('./routes/users')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('json spaces', 2)

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// app.use('/', routes)
app.use('/users', users)
app.get('/entries', entries.list)

app.get('/',entries.list)

app.get('/post', entries.form)
app.post('/post',validate.required('entry[title]'),validate.lengthAbove('entry[title]',4), entries.submit)


app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

if (app.get('env') == 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: {}
        })
    })
}

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})
module.exports = app