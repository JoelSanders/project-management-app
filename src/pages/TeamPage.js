import React, { useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Layout from '../components/layout/Layout';
import useProjectStore from '../store/projectStore';

const TeamPage = () => {
  const { users, projects, objectives, fetchUsers, fetchProjects, fetchObjectives } = useProjectStore();

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchObjectives();
  }, [fetchUsers, fetchProjects, fetchObjectives]);

  // Calculate user statistics
  const getUserStats = (userId) => {
    const assignedProjects = projects.filter(project => 
      project.assignedUsers.includes(userId)
    );
    
    const assignedObjectives = objectives.filter(objective => 
      objective.assignedUsers.includes(userId)
    );
    
    const completedObjectives = assignedObjectives.filter(objective => 
      objective.completed
    );
    
    return {
      projectCount: assignedProjects.length,
      objectiveCount: assignedObjectives.length,
      completedCount: completedObjectives.length,
      completionRate: assignedObjectives.length > 0 
        ? Math.round((completedObjectives.length / assignedObjectives.length) * 100) 
        : 0
    };
  };

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Team Members
      </Typography>
      
      <Grid container spacing={3}>
        {users.map(user => {
          const stats = getUserStats(user.id);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        bgcolor: 'primary.main',
                        mr: 2
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {user.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      icon={<AssignmentIcon />} 
                      label={`${stats.projectCount} Projects`} 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`${stats.completionRate}% Completion Rate`} 
                      color={stats.completionRate > 75 ? "success" : stats.completionRate > 50 ? "primary" : "default"}
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Assigned Projects:
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <List dense>
                      {projects.filter(project => project.assignedUsers.includes(user.id)).length > 0 ? (
                        projects
                          .filter(project => project.assignedUsers.includes(user.id))
                          .map((project, index, array) => (
                            <React.Fragment key={project.id}>
                              <ListItem>
                                <ListItemText
                                  primary={project.name}
                                  secondary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="body2" component="span">
                                        {project.objectives.length} objectives
                                      </Typography>
                                      <Chip 
                                        label={project.completed ? "Completed" : "In Progress"} 
                                        color={project.completed ? "success" : "primary"} 
                                        size="small"
                                      />
                                    </Box>
                                  }
                                />
                              </ListItem>
                              {index < array.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                          ))
                      ) : (
                        <ListItem>
                          <ListItemText
                            primary="No assigned projects"
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Layout>
  );
};

export default TeamPage;
