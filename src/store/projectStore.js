import { create } from 'zustand';

// Mock data for initial state
const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Redesign the university website for better user experience',
    completed: false,
    assignedUsers: ['1', '2'],
    objectives: ['1', '2', '3']
  },
  {
    id: '2',
    name: 'Student Portal',
    description: 'Develop a new student portal for course management',
    completed: false,
    assignedUsers: ['1'],
    objectives: ['4', '5']
  }
];

const mockObjectives = [
  {
    id: '1',
    title: 'Design mockups',
    description: 'Create design mockups for the new website',
    projectId: '1',
    completed: true,
    assignedUsers: ['2'],
    dueDate: '2023-06-30'
  },
  {
    id: '2',
    title: 'Frontend development',
    description: 'Implement the frontend based on approved designs',
    projectId: '1',
    completed: false,
    assignedUsers: ['1'],
    dueDate: '2023-07-15'
  },
  {
    id: '3',
    title: 'Backend integration',
    description: 'Connect frontend to backend services',
    projectId: '1',
    completed: false,
    assignedUsers: ['1', '2'],
    dueDate: '2023-07-30'
  },
  {
    id: '4',
    title: 'User requirements',
    description: 'Gather user requirements for the portal',
    projectId: '2',
    completed: true,
    assignedUsers: ['1'],
    dueDate: '2023-06-15'
  },
  {
    id: '5',
    title: 'Database design',
    description: 'Design the database schema for the portal',
    projectId: '2',
    completed: false,
    assignedUsers: ['1'],
    dueDate: '2023-06-30'
  }
];

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@ucl.edu' },
  { id: '2', name: 'Jane Smith', email: 'jane@ucl.edu' },
  { id: '3', name: 'Bob Johnson', email: 'bob@ucl.edu' }
];

// Create the store
const useProjectStore = create((set) => ({
  // State
  projects: mockProjects,
  objectives: mockObjectives,
  users: mockUsers,
  loading: false,
  error: null,

  // Project actions
  fetchProjects: async () => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      // For now, we're using mock data
      set({ projects: mockProjects, loading: false, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch projects', loading: false });
    }
  },

  getProject: (id) => {
    const { projects } = useProjectStore.getState();
    return projects.find(project => project.id === id);
  },

  createProject: async (projectData) => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      const newProject = {
        id: Date.now().toString(),
        ...projectData,
        completed: false,
        objectives: []
      };
      
      set(state => ({
        projects: [...state.projects, newProject],
        loading: false,
        error: null
      }));
      
      return { success: true, project: newProject };
    } catch (error) {
      set({ error: 'Failed to create project', loading: false });
      return { success: false, error: 'Failed to create project' };
    }
  },

  updateProject: async (id, projectData) => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      set(state => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, ...projectData } : project
        ),
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      set({ error: 'Failed to update project', loading: false });
      return { success: false, error: 'Failed to update project' };
    }
  },

  deleteProject: async (id) => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      set(state => ({
        projects: state.projects.filter(project => project.id !== id),
        objectives: state.objectives.filter(objective => objective.projectId !== id),
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      set({ error: 'Failed to delete project', loading: false });
      return { success: false, error: 'Failed to delete project' };
    }
  },

  // Objective actions
  fetchObjectives: async (projectId = null) => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      if (projectId) {
        const filteredObjectives = mockObjectives.filter(obj => obj.projectId === projectId);
        set({ objectives: filteredObjectives, loading: false, error: null });
      } else {
        set({ objectives: mockObjectives, loading: false, error: null });
      }
    } catch (error) {
      set({ error: 'Failed to fetch objectives', loading: false });
    }
  },

  getObjective: (id) => {
    const { objectives } = useProjectStore.getState();
    return objectives.find(objective => objective.id === id);
  },

  createObjective: async (objectiveData) => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      const newObjective = {
        id: Date.now().toString(),
        ...objectiveData,
        completed: false
      };
      
      set(state => ({
        objectives: [...state.objectives, newObjective],
        projects: state.projects.map(project => 
          project.id === objectiveData.projectId 
            ? { ...project, objectives: [...project.objectives, newObjective.id] } 
            : project
        ),
        loading: false,
        error: null
      }));
      
      return { success: true, objective: newObjective };
    } catch (error) {
      set({ error: 'Failed to create objective', loading: false });
      return { success: false, error: 'Failed to create objective' };
    }
  },

  updateObjective: async (id, objectiveData) => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      set(state => ({
        objectives: state.objectives.map(objective => 
          objective.id === id ? { ...objective, ...objectiveData } : objective
        ),
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      set({ error: 'Failed to update objective', loading: false });
      return { success: false, error: 'Failed to update objective' };
    }
  },

  deleteObjective: async (id) => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      const objective = useProjectStore.getState().objectives.find(obj => obj.id === id);
      
      set(state => ({
        objectives: state.objectives.filter(obj => obj.id !== id),
        projects: state.projects.map(project => 
          project.id === objective.projectId 
            ? { ...project, objectives: project.objectives.filter(objId => objId !== id) } 
            : project
        ),
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      set({ error: 'Failed to delete objective', loading: false });
      return { success: false, error: 'Failed to delete objective' };
    }
  },

  // User actions
  fetchUsers: async () => {
    set({ loading: true });
    try {
      // This would be an API call in a real application
      set({ users: mockUsers, loading: false, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch users', loading: false });
    }
  }
}));

export default useProjectStore;
