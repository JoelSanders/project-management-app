import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Layout from '../components/layout/Layout';
import useProjectStore from '../store/projectStore';
import { useAuth } from '../contexts/AuthContext';

const MyTasksPage = () => {
  const { objectives, projects, fetchObjectives, fetchProjects, updateObjective } = useProjectStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [myObjectives, setMyObjectives] = useState([]);
  const [filteredObjectives, setFilteredObjectives] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchObjectives();
    fetchProjects();
  }, [fetchObjectives, fetchProjects]);

  // Filter objectives assigned to current user
  useEffect(() => {
    if (objectives.length > 0 && currentUser) {
      const userObjectives = objectives.filter(objective => 
        objective.assignedUsers.includes(currentUser.id)
      );
      setMyObjectives(userObjectives);
      applyFilters(userObjectives, searchTerm, statusFilter, projectFilter);
    }
  }, [objectives, currentUser]);

  const applyFilters = (objectivesToFilter, search, status, project) => {
    let filtered = [...objectivesToFilter];
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(obj => 
        obj.title.toLowerCase().includes(search.toLowerCase()) ||
        obj.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      const isCompleted = status === 'completed';
      filtered = filtered.filter(obj => obj.completed === isCompleted);
    }
    
    // Apply project filter
    if (project !== 'all') {
      filtered = filtered.filter(obj => obj.projectId === project);
    }
    
    setFilteredObjectives(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(myObjectives, value, statusFilter, projectFilter);
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    applyFilters(myObjectives, searchTerm, value, projectFilter);
  };

  const handleProjectFilterChange = (e) => {
    const value = e.target.value;
    setProjectFilter(value);
    applyFilters(myObjectives, searchTerm, statusFilter, value);
  };

  const handleToggleComplete = async (objective) => {
    setLoading(true);
    try {
      await updateObjective(objective.id, {
        completed: !objective.completed
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        My Tasks
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            placeholder="Search tasks..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="project-filter-label">Project</InputLabel>
            <Select
              labelId="project-filter-label"
              id="project-filter"
              value={projectFilter}
              label="Project"
              onChange={handleProjectFilterChange}
            >
              <MenuItem value="all">All Projects</MenuItem>
              {projects.map(project => (
                <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      {/* Tasks List */}
      <Paper>
        <List>
          {filteredObjectives.length > 0 ? (
            filteredObjectives.map((objective) => {
              const project = projects.find(p => p.id === objective.projectId);
              
              return (
                <React.Fragment key={objective.id}>
                  <ListItem
                    secondaryAction={
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleViewProject(objective.projectId)}
                      >
                        View Project
                      </Button>
                    }
                  >
                    <ListItemIcon 
                      onClick={() => handleToggleComplete(objective)} 
                      sx={{ cursor: 'pointer' }}
                    >
                      {objective.completed ? 
                        <CheckCircleIcon color="success" /> : 
                        <PendingIcon color="action" />
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ mr: 2 }}>
                            {objective.title}
                          </Typography>
                          <Chip 
                            label={objective.completed ? "Completed" : "In Progress"} 
                            color={objective.completed ? "success" : "primary"} 
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                            {project?.name || 'Unknown Project'}
                          </Typography>
                          <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                            {objective.description}
                          </Typography>
                          {objective.dueDate && (
                            <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                              Due: {new Date(objective.dueDate).toLocaleDateString()}
                            </Typography>
                          )}
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
                primary="No tasks found"
                secondary={
                  searchTerm || statusFilter !== 'all' || projectFilter !== 'all' 
                    ? "Try changing your filters" 
                    : "You don't have any assigned tasks yet"
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Layout>
  );
};

export default MyTasksPage;
