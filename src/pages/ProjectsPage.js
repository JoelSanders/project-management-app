import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import useProjectStore from '../store/projectStore';

const ProjectsPage = () => {
  const { projects, users, fetchProjects, fetchUsers, createProject } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    assignedUsers: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [fetchProjects, fetchUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewProject({
      name: '',
      description: '',
      assignedUsers: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (event) => {
    const { value } = event.target;
    setNewProject(prev => ({
      ...prev,
      assignedUsers: value
    }));
  };

  const handleCreateProject = async () => {
    if (!newProject.name) return;
    
    setLoading(true);
    try {
      const result = await createProject(newProject);
      if (result.success) {
        handleCloseDialog();
        // Navigate to the new project
        navigate(`/projects/${result.project.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Project
        </Button>
      </Box>
      
      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Projects Grid */}
      <Grid container spacing={3}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {project.name}
                    </Typography>
                    <Chip 
                      label={project.completed ? "Completed" : "In Progress"} 
                      color={project.completed ? "success" : "primary"} 
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Assigned to: {project.assignedUsers.length} users
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Objectives: {project.objectives.length}
                    </Typography>
                  </Box>
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
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6">
                No projects found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? 'Try a different search term' : 'Create your first project to get started'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newProject.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="assigned-users-label">Assign Users</InputLabel>
            <Select
              labelId="assigned-users-label"
              id="assigned-users"
              multiple
              value={newProject.assignedUsers}
              onChange={handleUserSelect}
              input={<OutlinedInput label="Assign Users" />}
              renderValue={(selected) => {
                return selected.map(userId => {
                  const user = users.find(u => u.id === userId);
                  return user ? user.name : '';
                }).join(', ');
              }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Checkbox checked={newProject.assignedUsers.indexOf(user.id) > -1} />
                  <ListItemText primary={user.name} secondary={user.email} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={!newProject.name || loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ProjectsPage;
