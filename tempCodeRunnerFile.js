express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('./models/User');
const { urlencoded } = require('express');
const cors = require('cors');

app.use(cors());

app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://shahdhairya245:dhairya245@cluster0.6iitw.mongodb.net/SmartRetail', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

app.get('/',function(req,res){
    res.send('Hello');
});


app.use(express.json()); // Middleware to parse JSON request bodies
app.use(urlencoded());

app.get('/registerr',function(req,res){
    res.render('index');
});

app.post('/register', async function (req, res) {
    try {
        const { username, email, password } = req.body;

        // Check for missing fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the user
        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
            type: 'Customer'
        });

        res.status(201).json({ message: "User registered successfully.", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});



app.get('/profile',function(){
    res.render('profile');
});

app.get('/loginn',function(req,res){
      res.render('login');
});

app.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;

        console.log(req.body);
        

        console.log(email);
        console.log(password);
        

        // Check for missing fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate a token using default signing method
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username, type: user.type }, // Payload
            Buffer.from('defaultkey', 'base64'), // Implicit key generation
            { expiresIn: '1h' } // Token expiration time
        );

        res.status(200).json({
            message: "Login successful.",
            token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});


// Example of a protected route
app.get('/protected', async function (req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify the token asynchronously
        const user = await jwt.verify(token, Buffer.from('defaultkey', 'base64'));

        req.user = user; // Attach user info to the request
        res.status(200).json({ message: "Protected route accessed.", user });
    } catch (err) {
        return res.status(403).json({ message: "Invalid token." });
    }
});



app.listen(3000,function(req,res){
     console.log('Server is working');
});