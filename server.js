const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// const uploadDir = '/var/data/uploads';
// app.use('/uploads', express.static(uploadDir));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Admin schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

const JWT_SECRET = process.env.JWT_SECRET;

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    // Check if admin exists
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Validate password
    const isMatch = (password == admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ adminId: admin._id }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // File name in the format: timestamp + original file extension
    }
  });

  const upload = multer({ storage: storage });

// Job Application Schema
const jobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  position: { type: String, required: true },
  resume: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

// Career Schema
const careerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  positions: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  skills: { type: [String], required: true },
  responsibilities: { type: [String], required: true },
  description: { type: String, required: true },
  about: { type: String, required: true },
  keyResponsibilities: { type: String, required: true },
  keyResposibilty: { type: [String], required: true },
  niceToHave: { type: [String], required: true },
  salary: { type: String, required: true },
  exchangeProgram: { type: String, required: true },
  greatWorkPlace: { type: String, required: true },
  service: { type: String, required: true }
});

const Career = mongoose.model('Career', careerSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }
});

const Project = mongoose.model('Project', projectSchema);

// Job Applications Endpoints
app.post('/api/jobapplications', upload.single('resume'), async (req, res) => {
  const { name, email, contact, position, message, date} = req.body;
  const resume = req.file.path;
  try {
    const jobApplication = new JobApplication({
      name, email, contact, position,resume, message, date
    });
    await jobApplication.save();
    res.status(201).json(jobApplication);
  } catch (error) {
    console.error('Error creating job application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/jobapplications', async (req, res) => {
  try {
    const jobApplications = await JobApplication.find();
    res.json(jobApplications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/jobapplications/:id', async (req, res) => {
  try {
    const jobApplication = await JobApplication.findById(req.params.id);
    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json(jobApplication);
  } catch (error) {
    console.error('Error fetching job application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/jobapplications/:id', async (req, res) => {
  try {
    const jobApplication = await JobApplication.findByIdAndDelete(req.params.id);
    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json({ message: 'Job application deleted' });
  } catch (error) {
    console.error('Error deleting job application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Career Endpoints
app.post('/api/careers', upload.single('image'), async (req, res) => {
  const { title, positions, location, category, skills, responsibilities, description, about, keyResponsibilities, keyResposibilty, niceToHave, salary, exchangeProgram, greatWorkPlace, service } = req.body;
  const image = req.file.path;
  try {
    const career = new Career({
      title,
      positions,
      location,
      category,
      skills: JSON.parse(skills),
      responsibilities: JSON.parse(responsibilities),
      description,
      about,
      keyResponsibilities,
      keyResposibilty: JSON.parse(keyResposibilty),
      niceToHave: JSON.parse(niceToHave),
      salary,
      exchangeProgram,
      greatWorkPlace,
      service,
      image
    });
    await career.save();
    res.status(201).json(career);
  } catch (error) {
    console.error('Error creating career:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/careers', async (req, res) => {
  try {
    const careers = await Career.find();
    res.json(careers);
  } catch (error) {
    console.error('Error fetching careers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/careers/:id', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    res.json(career);
  } catch (error) {
    console.error('Error fetching career:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// New PUT endpoint for updating a career
app.put('/api/careers/:id', upload.single('image'), async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Convert arrays from JSON strings to arrays
    if (updateData.skills) updateData.skills = JSON.parse(updateData.skills);
    if (updateData.responsibilities) updateData.responsibilities = JSON.parse(updateData.responsibilities);
    if (updateData.keyResponsibility) updateData.keyResponsibility = JSON.parse(updateData.keyResponsibility);
    if (updateData.niceToHave) updateData.niceToHave = JSON.parse(updateData.niceToHave);

    const updatedCareer = await Career.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedCareer) {
      return res.status(404).json({ message: 'Career not found' });
    }

    res.json(updatedCareer);
  } catch (error) {
    console.error('Error updating career:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.delete('/api/careers/:id', async (req, res) => {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);
    if (!career) {
      return res.status(404).json({ message: 'career not found' });
    }
    res.json({ message: 'career deleted' });
  } catch (error) {
    console.error('Error deleting career:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Project Endpoints
app.post('/api/projects', upload.single('image'), async (req, res) => {
  const { title, description, category } = req.body;
  const image = req.file.path;
  try {
    const project = new Project({ title, description, category, image });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const job = await Project.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT project by ID
app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.category = category || project.category;
    if (image) {
      project.image = image;
    }

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting Project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});







// Define the schema and model
const teamSchema = new mongoose.Schema({
  image: String,
  name: String,
  designation: String,
  priority: Number,
  twitter: String,
  insta: String,
  linkedin: String
});

const Team = mongoose.model('Team', teamSchema);



// Create a new team member
app.post('/api/teams', upload.single('image'), async (req, res) => {
  const { name, designation, priority, twitter, insta, linkedin } = req.body;
  const image = req.file ? req.file.path : '';

  try {
    const newTeamMember = new Team({ image, name, designation, priority, twitter, insta, linkedin });
    await newTeamMember.save();
    res.status(201).json(newTeamMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all team members
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find().sort({ priority: 'asc' });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single team member by ID
app.get('/api/teams/:id', async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a single team member by ID
app.put('/api/teams/:id', upload.single('image'), async (req, res) => {
  const { name, designation, priority, twitter, insta, linkedin } = req.body;
  const image = req.file ? req.file.path : '';

  try {
    const updatedTeamMember = await Team.findByIdAndUpdate(
      req.params.id,
      { image, name, designation, priority, twitter, insta, linkedin },
      { new: true }
    );
    if (!updatedTeamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(updatedTeamMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a single team member by ID
app.delete('/api/teams/:id', async (req, res) => {
  try {
    const deletedTeamMember = await Team.findByIdAndDelete(req.params.id);
    if (!deletedTeamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listen on PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
