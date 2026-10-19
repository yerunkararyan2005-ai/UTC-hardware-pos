require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'UTC_MULTI_SHOP_SECRET_2026';

// Configure Nodemailer for Free Email OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. Send Real Email OTP API
app.post('/api/send-otp', async (req, res) => {
  try {
    console.log("--> OTP request aayi hai email ke liye:", req.body.email);
    const { email } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'UTC Hardware POS - Email Verification OTP',
      text: `Your 4-digit verification OTP for UTC Multi-Shop POS registration is: ${otp}. Valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    console.log("--> Email successfully send ho gaya!");
    res.json({ success: true, otp, message: 'OTP sent successfully to email!' });
  } catch (error) {
    console.log("--> Email send karne me error aaya:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Register Shop & Owner (Updated mapping for frontend fields)
app.post('/api/register', async (req, res) => {
  try {
    console.log("--> Register request aayi hai:", req.body);
    const { shopName, shopId, ownerName, contactNumber, shopEmail, address, gstin, description, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const shop = await prisma.shop.create({
      data: {
        shopName,
        shopId,
        ownerName,
        contact: contactNumber || '',
        email: shopEmail,
        address: address || 'Pune, Maharashtra',
        gstin: gstin || '',
        description: description || 'Hardware POS Shop',
        users: {
          create: { username, password: hashedPassword, role: 'OWNER' }
        }
      }
    });

    res.json({ success: true, message: 'Shop registered successfully!', shop });
  } catch (error) {
    console.log("--> Registration error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Login (With Shop Block/Active Check)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username }, include: { shop: true } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (!user.shop.isActive) {
      return res.status(403).json({ success: false, message: 'Aapki shop ka access block kar diya gaya hai. Please contact administrator.' });
    }

    const token = jwt.sign({ userId: user.id, shopId: user.shopId, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, shop: user.shop });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Get Products
app.get('/api/products/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const products = await prisma.product.findMany({ where: { shopId } });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Add Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, stock, unit, image, shopId } = req.body;
    const product = await prisma.product.create({
      data: { name, category, price: parseFloat(price), stock: parseInt(stock), unit, image, shopId }
    });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Generate Invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const { shopId, customer, phone, subtotal, tax, total, mode, items } = req.body;
    const count = await prisma.invoice.count({ where: { shopId } });
    const billNumber = count + 1;
    const invoiceCode = `UTC-INV-${billNumber.toString().padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        billNumber,
        invoiceCode,
        customer,
        phone,
        subtotal,
        tax,
        total,
        mode,
        shopId,
        items: {
          create: items.map(i => ({ name: i.name, price: i.price, qty: i.qty }))
        }
      },
      include: { items: true }
    });

    for (let item of items) {
      await prisma.product.updateMany({
        where: { shopId, name: item.name },
        data: { stock: { decrement: item.qty } }
      });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Block / Unblock Shop API (Admin)
app.patch('/api/admin/shop/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const shop = await prisma.shop.update({
      where: { id: req.params.id },
      data: { isActive }
    });
    res.json({ success: true, message: isActive ? 'Shop unblocked successfully!' : 'Shop blocked successfully!', shop });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[UTC Multi-Shop Server] Running on port ${PORT}`);
});