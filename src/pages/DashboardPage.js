import React, { useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import useProjectStore from '../store/projectStore';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { projects, objectives, fetchProjects, fetchObjectives } = useProjectStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchObjectives();
  }, [fetchProjects, fetchObjectives]);

  // Filter projects assigned to current user
  const myProjects = projects.filter(project => 
    project.assignedUsers.includes(currentUser?.id)
  );

  // Filter objectives assigned to current user
  const myObjectives = objectives.filter(objective => 
    objective.assignedUsers.includes(currentUser?.id)
  );

  // Calculate statistics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(project => project.completed).length;
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(objective => objective.completed).length;

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Projects
            </Typography>
            <Typography component="p" variant="h3">
              {totalProjects}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {completedProjects} completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              My Projects
            </Typography>
            <Typography component="p" variant="h3">
              {myProjects.length}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {myProjects.filter(p => p.completed).length} completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Objectives
            </Typography>
            <Typography component="p" variant="h3">
              {totalObjectives}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {completedObjectives} completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              My Objectives
            </Typography>
            <Typography component="p" variant="h3">
              {myObjectives.length}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {myObjectives.filter(o => o.completed).length} completed
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* My Projects */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            My Projects
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/projects')}
          >
            View All Projects
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {myProjects.length > 0 ? (
            myProjects.slice(0, 3).map((project) => (
              <Grid item xs={12} md={4} key={project.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div">
                        {project.name}
                      </Typography>
                      <Chip 
                        label={project.completed ? "Completed" : "In Progress"} 
                        color={project.completed ? "success" : "primary"} 
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {project.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1">
                  You don't have any assigned projects yet.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
      
      {/* My Objectives */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            My Objectives
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/my-tasks')}
          >
            View All Tasks
          </Button>
        </Box>
        
        <Paper>
          <List>
            {myObjectives.length > 0 ? (
              myObjectives.slice(0, 5).map((objective) => {
                const project = projects.find(p => p.id === objective.projectId);
                
                return (
                  <React.Fragment key={objective.id}>
                    <ListItem 
                      secondaryAction={
                        <Chip 
                          label={objective.completed ? "Completed" : "In Progress"} 
                          color={objective.completed ? "success" : "primary"} 
                          size="small"
                        />
                      }
                    >
                      <ListItemIcon>
                        {objective.completed ? <CheckCircleIcon color="success" /> : <PendingIcon color="action" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={objective.title} 
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {project?.name || 'Unknown Project'}
                            </Typography>
                            {" — "}{objective.description}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                );
              })
            ) : (
              <ListItem>
                <ListItemText 
                  primary="No tasks assigned to you" 
                  secondary="You don't have any assigned objectives yet."
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </Layout>
  );
};

export default DashboardPage;
