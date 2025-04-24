import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Chip, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText as MuiListItemText,
  Avatar,
  AvatarGroup,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Layout from '../components/layout/Layout';
import useProjectStore from '../store/projectStore';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { 
    getProject, 
    objectives, 
    users, 
    fetchObjectives, 
    fetchUsers, 
    updateProject, 
    deleteProject,
    createObjective,
    updateObjective,
    deleteObjective
  } = useProjectStore();
  
  const [project, setProject] = useState(null);
  const [projectObjectives, setProjectObjectives] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [objectiveDialogOpen, setObjectiveDialogOpen] = useState(false);
  const [assignUsersDialogOpen, setAssignUsersDialogOpen] = useState(false);
  const [editedProject, setEditedProject] = useState({
    name: '',
    description: '',
    completed: false
  });
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedUsers: []
  });
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load project data
  useEffect(() => {
    const loadProject = () => {
      const projectData = getProject(projectId);
      if (projectData) {
        setProject(projectData);
        setEditedProject({
          name: projectData.name,
          description: projectData.description,
          completed: projectData.completed
        });
        setAssignedUsers(projectData.assignedUsers);
      } else {
        // Project not found, redirect to projects page
        navigate('/projects');
      }
    };
    
    loadProject();
    fetchObjectives();
    fetchUsers();
  }, [projectId, getProject, fetchObjectives, fetchUsers, navigate]);

  // Filter objectives for this project
  useEffect(() => {
    if (objectives.length > 0 && project) {
      const filteredObjectives = objectives.filter(obj => obj.projectId === projectId);
      setProjectObjectives(filteredObjectives);
    }
  }, [objectives, project, projectId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Edit project handlers
  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    // Reset form
    if (project) {
      setEditedProject({
        name: project.name,
        description: project.description,
        completed: project.completed
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleComplete = async () => {
    if (!project) return;
    
    setLoading(true);
    try {
      const result = await updateProject(projectId, {
        completed: !project.completed
      });
      
      if (result.success) {
        setProject(prev => ({
          ...prev,
          completed: !prev.completed
        }));
        setEditedProject(prev => ({
          ...prev,
          completed: !prev.completed
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!editedProject.name) return;
    
    setLoading(true);
    try {
      const result = await updateProject(projectId, editedProject);
      
      if (result.success) {
        setProject(prev => ({
          ...prev,
          ...editedProject
        }));
        handleEditDialogClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete project handlers
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteProject = async () => {
    setLoading(true);
    try {
      const result = await deleteProject(projectId);
      
      if (result.success) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  // Objective handlers
  const handleObjectiveDialogOpen = (objective = null) => {
    if (objective) {
      setSelectedObjective(objective);
      setNewObjective({
        title: objective.title,
        description: objective.description,
        dueDate: objective.dueDate || '',
        assignedUsers: objective.assignedUsers
      });
    } else {
      setSelectedObjective(null);
      setNewObjective({
        title: '',
        description: '',
        dueDate: '',
        assignedUsers: []
      });
    }
    setObjectiveDialogOpen(true);
  };

  const handleObjectiveDialogClose = () => {
    setObjectiveDialogOpen(false);
    setNewObjective({
      title: '',
      description: '',
      dueDate: '',
      assignedUsers: []
    });
    setSelectedObjective(null);
  };

  const handleObjectiveInputChange = (e) => {
    const { name, value } = e.target;
    setNewObjective(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleObjectiveUserSelect = (event) => {
    const { value } = event.target;
    setNewObjective(prev => ({
      ...prev,
      assignedUsers: value
    }));
  };

  const handleSaveObjective = async () => {
    if (!newObjective.title) return;
    
    setLoading(true);
    try {
      if (selectedObjective) {
        // Update existing objective
        const result = await updateObjective(selectedObjective.id, newObjective);
        if (result.success) {
          handleObjectiveDialogClose();
        }
      } else {
        // Create new objective
        const objectiveData = {
          ...newObjective,
          projectId
        };
        
        const result = await createObjective(objectiveData);
        if (result.success) {
          handleObjectiveDialogClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleObjectiveComplete = async (objective) => {
    setLoading(true);
    try {
      await updateObjective(objective.id, {
        completed: !objective.completed
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObjective = async (objectiveId) => {
    if (window.confirm('Are you sure you want to delete this objective?')) {
      setLoading(true);
      try {
        await deleteObjective(objectiveId);
      } finally {
        setLoading(false);
      }
    }
  };

  // Assign users handlers
  const handleAssignUsersDialogOpen = () => {
    setAssignUsersDialogOpen(true);
  };

  const handleAssignUsersDialogClose = () => {
    setAssignUsersDialogOpen(false);
    // Reset to current project users
    if (project) {
      setAssignedUsers(project.assignedUsers);
    }
  };

  const handleAssignedUsersChange = (event) => {
    const { value } = event.target;
    setAssignedUsers(value);
  };

  const handleSaveAssignedUsers = async () => {
    setLoading(true);
    try {
      const result = await updateProject(projectId, {
        assignedUsers
      });
      
      if (result.success) {
        setProject(prev => ({
          ...prev,
          assignedUsers
        }));
        handleAssignUsersDialogClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <Layout>
        <Typography>Loading project...</Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={project.completed ? "Completed" : "In Progress"} 
                color={project.completed ? "success" : "primary"} 
                sx={{ mr: 2 }}
              />
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleToggleComplete}
                disabled={loading}
              >
                {project.completed ? "Mark as In Progress" : "Mark as Completed"}
              </Button>
            </Box>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              sx={{ mr: 1 }}
              onClick={handleEditDialogOpen}
            >
              Edit
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={handleDeleteDialogOpen}
            >
              Delete
            </Button>
          </Box>
        </Box>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" paragraph>
            {project.description}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Assigned Team Members:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AvatarGroup max={5}>
                  {project.assignedUsers.map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? (
                      <Tooltip title={user.name} key={user.id}>
                        <Avatar>
                          {user.name.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    ) : null;
                  })}
                </AvatarGroup>
                <Button 
                  startIcon={<PersonAddIcon />} 
                  sx={{ ml: 2 }}
                  onClick={handleAssignUsersDialogOpen}
                >
                  Manage Team
                </Button>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle1">
                Objectives: {projectObjectives.length}
              </Typography>
              <Typography variant="body2">
                Completed: {projectObjectives.filter(obj => obj.completed).length}
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
              <Tab label="Objectives" id="project-tab-0" />
              <Tab label="Activity" id="project-tab-1" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Project Objectives
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleObjectiveDialogOpen()}
              >
                Add Objective
              </Button>
            </Box>
            
            <Paper>
              <List>
                {projectObjectives.length > 0 ? (
                  projectObjectives.map((objective) => (
                    <React.Fragment key={objective.id}>
                      <ListItem
                        secondaryAction={
                          <Box>
                            <IconButton 
                              edge="end" 
                              aria-label="edit"
                              onClick={() => handleObjectiveDialogOpen(objective)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => handleDeleteObjective(objective.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon onClick={() => handleToggleObjectiveComplete(objective)} sx={{ cursor: 'pointer' }}>
                          {objective.completed ? <CheckCircleIcon color="success" /> : <PendingIcon color="action" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={objective.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {objective.description}
                              </Typography>
                              {objective.dueDate && (
                                <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                  Due: {new Date(objective.dueDate).toLocaleDateString()}
                                </Typography>
                              )}
                              <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                Assigned to: {objective.assignedUsers.map(userId => {
                                  const user = users.find(u => u.id === userId);
                                  return user ? user.name : '';
                                }).join(', ')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No objectives yet"
                      secondary="Add objectives to track progress on this project"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Project Activity
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1">
                Activity tracking will be implemented in a future update.
              </Typography>
            </Paper>
          </TabPanel>
        </Box>
      </Box>
      
      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editedProject.name}
            onChange={handleEditInputChange}
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
            value={editedProject.description}
            onChange={handleEditInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveProject} 
            variant="contained"
            disabled={!editedProject.name || loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Project Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            All objectives associated with this project will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button 
            onClick={handleDeleteProject} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create/Edit Objective Dialog */}
      <Dialog open={objectiveDialogOpen} onClose={handleObjectiveDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedObjective ? 'Edit Objective' : 'Add New Objective'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Objective Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newObjective.title}
            onChange={handleObjectiveInputChange}
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
            rows={3}
            value={newObjective.description}
            onChange={handleObjectiveInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="dueDate"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={newObjective.dueDate}
            onChange={handleObjectiveInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="objective-assigned-users-label">Assign Users</InputLabel>
            <Select
              labelId="objective-assigned-users-label"
              id="objective-assigned-users"
              multiple
              value={newObjective.assignedUsers}
              onChange={handleObjectiveUserSelect}
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
                  <Checkbox checked={newObjective.assignedUsers.indexOf(user.id) > -1} />
                  <MuiListItemText primary={user.name} secondary={user.email} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleObjectiveDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveObjective} 
            variant="contained"
            disabled={!newObjective.title || loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Assign Users Dialog */}
      <Dialog open={assignUsersDialogOpen} onClose={handleAssignUsersDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Team Members</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="project-assigned-users-label">Assigned Users</InputLabel>
            <Select
              labelId="project-assigned-users-label"
              id="project-assigned-users"
              multiple
              value={assignedUsers}
              onChange={handleAssignedUsersChange}
              input={<OutlinedInput label="Assigned Users" />}
              renderValue={(selected) => {
                return selected.map(userId => {
                  const user = users.find(u => u.id === userId);
                  return user ? user.name : '';
                }).join(', ');
              }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Checkbox checked={assignedUsers.indexOf(user.id) > -1} />
                  <MuiListItemText primary={user.name} secondary={user.email} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignUsersDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveAssignedUsers} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ProjectDetailPage;
