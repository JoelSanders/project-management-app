// api/projects/[id]/objectives.js
import { connectToDatabase } from '../../../utils/database';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Set CORS headers (same as above)
  // ...

  // Get project ID from URL
  const { id } = req.query;
  
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  
  try {
    const { db } = await connectToDatabase();
    const projectId = new ObjectId(id);
    
    // Check if project exists
    const project = await db.collection('projects').findOne({ _id: projectId });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (req.method === 'GET') {
      // Get all objectives for this project
      const objectives = await db.collection('objectives')
        .find({ projectId: id.toString() })
        .toArray();
      
      return res.status(200).json(objectives);
    } 
    
    else if (req.method === 'POST') {
      // Create a new objective for this project
      const { title, description, dueDate, assignedUsers = [] } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Objective title is required' });
      }
      
      const newObjective = {
        title,
        description,
        projectId: id.toString(),
        dueDate,
        assignedUsers,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert the objective
      const result = await db.collection('objectives').insertOne(newObjective);
      
      // Update the project to include this objective
      await db.collection('projects').updateOne(
        { _id: projectId },
        { $push: { objectives: result.insertedId.toString() } }
      );
      
      return res.status(201).json({
        success: true,
        objective: { ...newObjective, id: result.insertedId }
      });
    } 
    
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}