// server.js - Backend with Location-Based Search
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ==================== MONGODB CONNECTION (ATLAS) ====================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50000000 }
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['tenant', 'owner'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Property Schema with Geolocation
const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  propertyType: { 
    type: String, 
    enum: ['house', 'apartment', 'condo', 'villa', 'land', 'agriculture', 'commercial', 'studio'],
    required: true 
  },
  listingType: { type: String, enum: ['rent', 'sale'], required: true },
  price: { type: Number, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  
  // Location coordinates
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  
  // Dynamic fields based on property type
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  floors: { type: Number },
  parking: { type: Number },
  yearBuilt: { type: Number },
  furnishing: { 
    type: String, 
    enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
    default: 'unfurnished'
  },
  
  area: { type: Number, required: true },
  areaUnit: { type: String, default: 'sqft' },
  amenities: [String],
  images: [String],
  video3D: { type: String },
  status: { type: String, enum: ['available', 'rented', 'sold'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create 2dsphere index for geospatial queries
propertySchema.index({ location: '2dsphere' });

const Property = mongoose.model('Property', propertySchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Interest Schema
const interestSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantName: { type: String, required: true },
  tenantEmail: { type: String, required: true },
  tenantPhone: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyTitle: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Interest = mongoose.model('Interest', interestSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['interest_received', 'interest_accepted', 'interest_rejected', 'property_update'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Owner Middleware
const ownerMiddleware = (req, res, next) => {
  if (req.userRole !== 'owner') {
    return res.status(403).json({ message: 'Access denied. Only owners can perform this action.' });
  }
  next();
};

// Helper function to create notification
async function createNotification(userId, type, title, message, link = null, relatedId = null) {
  const notification = new Notification({
    userId,
    type,
    title,
    message,
    link,
    relatedId
  });
  await notification.save();
  return notification;
}

// Geocoding helper (simple city to coordinates mapping - in production use real geocoding API)
const cityCoordinates = {
  'hyderabad': [78.4867, 17.3850],
  'mumbai': [72.8777, 19.0760],
  'delhi': [77.1025, 28.7041],
  'bangalore': [77.5946, 12.9716],
  'chennai': [80.2707, 13.0827],
  'kolkata': [88.3639, 22.5726],
  'pune': [73.8567, 18.5204],
  'vadlamudi': [80.4364, 16.5062],
  'guntur': [80.4365, 16.3067],
  'vijayawada': [80.6480, 16.5062],
  'visakhapatnam': [83.2185, 17.6869],
  'tirupati': [79.4192, 13.6288]
};

function getCityCoordinates(city) {
  const cityLower = city.toLowerCase().trim();
  return cityCoordinates[cityLower] || [0, 0];
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PROPERTY ROUTES ====================

// Create Property (Owner only)
app.post('/api/properties', authMiddleware, ownerMiddleware, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video3D', maxCount: 1 }
]), async (req, res) => {
  try {
    const owner = await User.findById(req.userId);
    
    const propertyData = {
      ...req.body,
      ownerId: req.userId,
      ownerName: owner.name,
      ownerEmail: owner.email,
      ownerPhone: owner.phone,
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : []
    };

    // Set coordinates based on city
    const coordinates = getCityCoordinates(propertyData.city);
    propertyData.location = {
      type: 'Point',
      coordinates: coordinates
    };

    if (req.files.images) {
      propertyData.images = req.files.images.map(file => file.filename);
    }

    if (req.files.video3D) {
      propertyData.video3D = req.files.video3D[0].filename;
    }

    const property = new Property(propertyData);
    await property.save();

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Properties with Location-Based Filtering
app.get('/api/properties', async (req, res) => {
  try {
    const { 
      propertyType, 
      listingType, 
      city, 
      minPrice, 
      maxPrice, 
      status, 
      search,
      nearMe,
      userLat,
      userLon,
      radius // in kilometers
    } = req.query;
    
    let query = {};

    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    if (status) query.status = status;
    else query.status = 'available';

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    let properties;

    // Location-based search
    if (nearMe === 'true' && userLat && userLon) {
      const maxDistance = radius ? Number(radius) * 1000 : 10000; // Default 10km in meters
      
      properties = await Property.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(userLon), Number(userLat)]
            },
            $maxDistance: maxDistance
          }
        }
      }).sort({ createdAt: -1 });

      // Add distance to each property
      properties = properties.map(prop => {
        const propObj = prop.toObject();
        const distance = calculateDistance(
          Number(userLat),
          Number(userLon),
          propObj.location.coordinates[1],
          propObj.location.coordinates[0]
        );
        propObj.distance = distance.toFixed(2);
        return propObj;
      });
    } else if (city) {
      // City-based search
      query.city = new RegExp(city, 'i');
      properties = await Property.find(query).sort({ createdAt: -1 });
      
      properties = properties.map(prop => {
        const propObj = prop.toObject();
        propObj.distance = null;
        return propObj;
      });
    } else {
      // General search
      properties = await Property.find(query).sort({ createdAt: -1 });
      
      properties = properties.map(prop => {
        const propObj = prop.toObject();
        propObj.distance = null;
        return propObj;
      });
    }

    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Property by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Owner's Properties
app.get('/api/properties/owner/my-properties', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Property (Owner only)
app.put('/api/properties/:id', authMiddleware, ownerMiddleware, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video3D', maxCount: 1 }
]), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body, updatedAt: Date.now() };

    if (req.body.amenities && typeof req.body.amenities === 'string') {
      updateData.amenities = JSON.parse(req.body.amenities);
    }

    // Update coordinates if city changed
    if (req.body.city && req.body.city !== property.city) {
      const coordinates = getCityCoordinates(req.body.city);
      updateData.location = {
        type: 'Point',
        coordinates: coordinates
      };
    }

    if (req.files?.images) {
      updateData.images = req.files.images.map(file => file.filename);
    }

    if (req.files?.video3D) {
      updateData.video3D = req.files.video3D[0].filename;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Property (Owner only)
app.delete('/api/properties/:id', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== INTEREST/BOOKING ROUTES ====================

// Express Interest (Tenant only)
app.post('/api/interests', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can express interest' });
    }

    const { propertyId, message } = req.body;
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const existingInterest = await Interest.findOne({
      propertyId,
      tenantId: req.userId,
      status: 'pending'
    });

    if (existingInterest) {
      return res.status(400).json({ message: 'You have already expressed interest in this property' });
    }

    const tenant = await User.findById(req.userId);

    const interest = new Interest({
      propertyId,
      tenantId: req.userId,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      tenantPhone: tenant.phone,
      ownerId: property.ownerId,
      propertyTitle: property.title,
      message: message || ''
    });

    await interest.save();

    await createNotification(
      property.ownerId,
      'interest_received',
      'New Interest Received!',
      `${tenant.name} is interested in "${property.title}"`,
      `/owner-dashboard`,
      interest._id
    );

    res.status(201).json({ message: 'Interest expressed successfully', interest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Tenant's Interests
app.get('/api/interests/my-interests', authMiddleware, async (req, res) => {
  try {
    const interests = await Interest.find({ tenantId: req.userId })
      .populate('propertyId')
      .sort({ createdAt: -1 });
    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Owner's Received Interests
app.get('/api/interests/received', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const interests = await Interest.find({ ownerId: req.userId })
      .populate('propertyId')
      .sort({ createdAt: -1 });
    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Interest Status (Owner only)
app.put('/api/interests/:id', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const interest = await Interest.findById(req.params.id);

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    if (interest.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    interest.status = status;
    interest.updatedAt = Date.now();
    await interest.save();

    const notificationType = status === 'accepted' ? 'interest_accepted' : 'interest_rejected';
    const notificationTitle = status === 'accepted' ? 'Interest Accepted!' : 'Interest Update';
    const notificationMessage = status === 'accepted' 
      ? `Your interest in "${interest.propertyTitle}" has been accepted!`
      : `Your interest in "${interest.propertyTitle}" was not accepted.`;

    await createNotification(
      interest.tenantId,
      notificationType,
      notificationTitle,
      notificationMessage,
      `/property/${interest.propertyId}`,
      interest._id
    );

    res.json({ message: 'Interest status updated', interest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== NOTIFICATION ROUTES ====================

app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.userId, 
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/notifications/:id', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== FEEDBACK ROUTES ====================

app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;

    const feedback = new Feedback({
      userId: userId || null,
      name,
      email,
      subject,
      message
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== STATS ROUTES ====================

app.get('/api/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    if (req.userRole === 'owner') {
      const totalProperties = await Property.countDocuments({ ownerId: req.userId });
      const availableProperties = await Property.countDocuments({ ownerId: req.userId, status: 'available' });
      const rentedProperties = await Property.countDocuments({ ownerId: req.userId, status: 'rented' });
      const soldProperties = await Property.countDocuments({ ownerId: req.userId, status: 'sold' });
      const pendingInterests = await Interest.countDocuments({ ownerId: req.userId, status: 'pending' });
      const acceptedInterests = await Interest.countDocuments({ ownerId: req.userId, status: 'accepted' });

      res.json({
        totalProperties,
        availableProperties,
        rentedProperties,
        soldProperties,
        pendingInterests,
        acceptedInterests
      });
    } else {
      const totalProperties = await Property.countDocuments({ status: 'available' });
      const forRent = await Property.countDocuments({ status: 'available', listingType: 'rent' });
      const forSale = await Property.countDocuments({ status: 'available', listingType: 'sale' });
      const myInterests = await Interest.countDocuments({ tenantId: req.userId });
      const acceptedInterests = await Interest.countDocuments({ tenantId: req.userId, status: 'accepted' });

      res.json({
        totalProperties,
        forRent,
        forSale,
        myInterests,
        acceptedInterests
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});