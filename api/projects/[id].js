// api/projects/[id].js
import { connectToDatabase } from '../../utils/database';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Set CORS headers (same as in index.js)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get project ID from URL
  const { id } = req.query;
  
  // Validate ID format
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  
  try {
    const { db } = await connectToDatabase();
    const objectId = new ObjectId(id);
    
    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get a specific project
      const project = await db.collection('projects').findOne({ _id: objectId });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      return res.status(200).json({
        ...project,
        id: project._id // Ensure ID is accessible as 'id'
      });
    } 
    
    else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Update a project
      const updateData = { ...req.body, updatedAt: new Date() };
      
      // Remove _id from update data if present
      delete updateData._id;
      delete updateData.id;
      
      const result = await db.collection('projects').updateOne(
        { _id: objectId },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Get the updated project
      const updatedProject = await db.collection('projects').findOne({ _id: objectId });
      
      return res.status(200).json({
        success: true,
        project: {
          ...updatedProject,
          id: updatedProject._id
        }
      });
    } 
    
    else if (req.method === 'DELETE') {
      // Delete a project
      const result = await db.collection('projects').deleteOne({ _id: objectId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      return res.status(200).json({ success: true });
    } 
    
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}