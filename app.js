const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const AppError = require('./AppError');

mongoose.connect('mongodb://yelpcampdbadmin:secret@localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        throw new AppError('Campground not found', 404);
    }
    res.render('campgrounds/show', { campground })
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        throw new AppError('Edit: Campground not found', 404);
    }
    res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
    const updatedCampground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { returnDocument: 'after', runValidators: true });
    if (!updatedCampground) {
        throw new AppError('Update: Campground not found', 404);
    }
    res.redirect(`/campgrounds/${updatedCampground._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const toDelete = await Campground.findByIdAndDelete(req.params.id)
    if (!toDelete) {
        throw new AppError('Campground not found', 404);
    }
    res.redirect('/campgrounds')
})

app.use((err, req, res, next) => {
    if (err.name === 'CastError') {
        err = new AppError('Product Not Found (Invalid ID)', 404);
    }
    if (err.name === 'ValidationError') {
        err = new AppError(err.message, 400);
    }
    const { status = 500, message = 'Something went wrong!' } = err;
    res.status(status).send(message);
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})