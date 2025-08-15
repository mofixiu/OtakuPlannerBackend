const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const { resolve } = require('path');
const apiAdminRoute = require('./routes/apiAdminRoute');
const adminRoute = require('./routes/apiAdminRoute');
const fileUpload = require('express-fileupload');
const checkApiAuth = require('./middlewares/checkApiAuth');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('./middlewares/flash');
const checkAuth = require('./middlewares/checkApiAuth');
const userRoutes = require('./routes/userRoute'); 

// Add CORS support for the API
app.use(cors());

app.use(session({
    secret: "don't share this secret with anyone",
    resave: false,
    saveUninitialized: true,
}));
app.use(flash)


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true,
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
}));

// Use this configuration instead
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', resolve('views'));
app.use(express.static(resolve('assets')));
app.use(express.static(resolve('uploads')));
app.use('/api', userRoutes);
app.use('/api/admin', checkApiAuth, apiAdminRoute);
app.use('/admin', checkAuth, adminRoute); // ssr



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}\nhttp://localhost:${PORT}`);
});