// api/projects/index.js
import { connectToDatabase } from '../../utils/database';

export default async function handler(req, res) {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // In production, set this to your actual domain
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request (for CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get all projects
      const projects = await db.collection('projects').find({}).toArray();
      return res.status(200).json(projects);
    } 
    
    else if (req.method === 'POST') {
      // Create a new project
      const { name, description, assignedUsers = [] } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      
      // Create project object
      const newProject = {
        name,
        description,
        assignedUsers,
        completed: false,
        objectives: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert into database
      const result = await db.collection('projects').insertOne(newProject);
      
      // Return the created project with its ID
      return res.status(201).json({ 
        success: true, 
        project: { ...newProject, id: result.insertedId }
      });
    } 
    
    else {
      // Method not allowed
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}