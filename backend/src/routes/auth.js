const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../db');

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT secret exists
if (!JWT_SECRET) {
    process.exit(1);
}

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Username or email already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, 'admin']
        );

        res.status(201).json({ 
            success: true,
            message: 'User registered successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error registering user' 
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        const user = users[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error logging in' 
        });
    }
});

module.exports = router; 