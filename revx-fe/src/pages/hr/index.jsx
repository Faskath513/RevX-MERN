import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Card,
  CardContent,
  Chip,
  Badge,
  Fade,
  Skeleton,
  Container,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  TableContainer,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayCircle as PlayCircleIcon
} from '@mui/icons-material';
import { useRouter } from "next/router";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import HRLayout from '../../components/HRLayout';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336'];
const STATUS_COLORS = {
  completed: '#4caf50',
  'in-progress': '#2196f3', 
  scheduled: '#f0f0f0ff'
};

const HRDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const theme = useTheme();

  // Filters for Goals and Tasks
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedGoalStatus, setSelectedGoalStatus] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('User is not authenticated. Redirecting to login...');
      setLoading(false);
      router.push('/auth/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const [goalsRes, tasksRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/hr`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/all`, { headers: { Authorization: `Bearer ${user.token}` } }),
        ]);
         // Fetch profile picture
        const profilePicResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}/profile-picture`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            responseType: 'blob'
          }
        );
        setGoals(goalsRes.data);
        setTasks(tasksRes.data);
        setImagePreview(URL.createObjectURL(profilePicResponse.data));
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated]);

  // Group goals by manager and calculate completion stats per manager
  const goalsByManager = goals.reduce((acc, goal) => {
    const managerId = goal.managerId?._id || 'Unknown';
    const managerName = goal.managerId?.username || 'Unknown Manager';

    if (!acc[managerId]) {
      acc[managerId] = {
        managerName,
        total: 0,
        completed: 0,
        inProgress: 0,
        scheduled: 0,
      };
    }
    acc[managerId].total += 1;

    if (goal.status === 'completed') acc[managerId].completed += 1;
    else if (goal.status === 'in-progress') acc[managerId].inProgress += 1;
    else if (goal.status === 'scheduled') acc[managerId].scheduled += 1;

    return acc;
  }, {});

  const managerGoalChartData = Object.values(goalsByManager).map(manager => ({
    managerName: manager.managerName,
    Completion: manager.total > 0 ? (manager.completed / manager.total) * 100 : 0,
    'In Progress': manager.total > 0 ? (manager.inProgress / manager.total) * 100 : 0,
    Scheduled: manager.total > 0 ? (manager.scheduled / manager.total) * 100 : 0,
  }));

  // Overall task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
  };

  const taskChartData = [
    { name: 'Completed', value: taskStats.completed },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'Scheduled', value: taskStats.scheduled },
  ];

  // Filter goals based on manager and goal status
  const filteredGoals = goals.filter(goal => {
    const managerMatch = selectedManager === '' || goal.managerId?._id === selectedManager;
    const statusMatch = selectedGoalStatus === '' || goal.status === selectedGoalStatus;
    return managerMatch && statusMatch;
  });

  // Filter tasks based on project and task status
  const filteredTasks = tasks.filter(task => {
    const projectMatch = selectedProjectId === '' || task.projectId?._id === selectedProjectId;
    const statusMatch = selectedTaskStatus === '' || task.status === selectedTaskStatus;
    return projectMatch && statusMatch;
  });

  // Unique managers for goal filter dropdown
  const managersForFilter = Object.entries(goalsByManager).map(([id, data]) => ({
    id,
    name: data.managerName,
  }));

  // Unique projects from goals for task project filter
  const uniqueProjects = Array.from(new Map(goals.map(goal => [goal._id, goal])).values());

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'in-progress': return <PlayCircleIcon sx={{ fontSize: 16 }} />;
      case 'scheduled': return <ScheduleIcon sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  const getStatusChip = (status) => (
    <Chip
      icon={getStatusIcon(status)}
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{
        background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
        color: STATUS_COLORS[status] || '#666',
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: STATUS_COLORS[status] || '#666',
        }
      }}
    />
  );

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: color, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <HRLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={200} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                  <Skeleton variant="rectangular" height={150} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rectangular" height={400} />
          </Stack>
        </Container>
      </HRLayout>
    );
  }

  if (error) {
    return (
      <HRLayout>
        <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Container>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
        }
      }}>
        <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box>
              {/* Enhanced Header */}
              <Card 
                elevation={0}
                sx={{ 
                  mb: 4,
                  background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                  color: 'white',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'translate(50%, -50%)',
                  }}
                />
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <DashboardIcon sx={{ fontSize: 40 }} />
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                          HR Dashboard
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ opacity: 0.9, mb: 1 }}>
                        Welcome back, {user?.username}!
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        {user?.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#4caf50',
                              border: '3px solid white',
                            }}
                          />
                        }
                      >
                        <Avatar
                          src={imagePreview || '/default-avatar.png'}
                          sx={{ 
                            width: 120, 
                            height: 120, 
                            border: '4px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                          }}
                        />
                      </Badge>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Goals"
                    value={goals.length}
                    icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
                    color="#4caf50"
                    subtitle="Active projects"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Tasks"
                    value={tasks.length}
                    icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
                    color="#2196f3"
                    subtitle="All assignments"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Active Managers"
                    value={Object.keys(goalsByManager).length}
                    icon={<PeopleIcon sx={{ fontSize: 28 }} />}
                    color="#ff9800"
                    subtitle="Managing projects"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Completion Rate"
                    value={`${goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%`}
                    icon={<TimelineIcon sx={{ fontSize: 28 }} />}
                    color="#9c27b0"
                    subtitle="Overall progress"
                  />
                </Grid>
              </Grid>

              {/* Charts Section */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Manager Goals Progress */}
                <Grid item xs={12} lg={8}>
                  <Card elevation={0} sx={{ height: 450, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3, height: '100%' }}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                        <TrendingUpIcon color="primary" />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          Manager Goal Progress Rates
                        </Typography>
                      </Stack>
                      {managerGoalChartData.length === 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                          <Typography color="text.secondary">No goals data available</Typography>
                        </Box>
                      ) : (
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart
                            data={managerGoalChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="managerName" 
                              angle={-45} 
                              textAnchor="end" 
                              interval={0} 
                              height={80}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              domain={[0, 100]} 
                              tickFormatter={val => `${val}%`}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              formatter={(value) => `${value.toFixed(1)}%`}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Bar dataKey="Completion" stackId="a" fill="#4caf50" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="In Progress" stackId="a" fill="#2196f3" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Scheduled" stackId="a" fill="#0c4672" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Task Distribution */}
                <Grid item xs={12} lg={4}>
                  <Card elevation={0} sx={{ height: 450, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3, height: '100%' }}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                        <AssignmentIcon color="primary" />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          Task Distribution
                        </Typography>
                      </Stack>
                      {tasks.length === 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                          <Typography color="text.secondary">No tasks data available</Typography>
                        </Box>
                      ) : (
                        <Box>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={taskChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                              >
                                {taskChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <Stack spacing={1} mt={2}>
                            {taskChartData.map((entry, index) => (
                              <Stack key={entry.name} direction="row" alignItems="center" spacing={2}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: COLORS[index % COLORS.length],
                                  }}
                                />
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  {entry.name}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {entry.value}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Data Tables */}
              <Grid container spacing={3}>
                {/* Goals Table */}
                <Grid item xs={12} lg={6}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ p: 3, pb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                          <TrendingUpIcon color="primary" />
                          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                            Goals Overview
                          </Typography>
                          <Chip
                            icon={<FilterListIcon />}
                            label={`${filteredGoals.length} of ${goals.length}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        {/* Filters */}
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Manager</InputLabel>
                            <Select
                              value={selectedManager}
                              label="Manager"
                              onChange={(e) => setSelectedManager(e.target.value)}
                            >
                              <MenuItem value="">All Managers</MenuItem>
                              {managersForFilter.map(manager => (
                                <MenuItem key={manager.id} value={manager.id}>
                                  {manager.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={selectedGoalStatus}
                              label="Status"
                              onChange={(e) => setSelectedGoalStatus(e.target.value)}
                            >
                              <MenuItem value="">All Status</MenuItem>
                              <MenuItem value="scheduled">Scheduled</MenuItem>
                              <MenuItem value="in-progress">In Progress</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                          </FormControl>
                        </Stack>
                      </Box>

                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                                Project
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                                Manager
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                                Status
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                                Due Date
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredGoals.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                                  <Typography color="text.secondary">
                                    No goals match your filters
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredGoals.map(goal => (
                                <TableRow 
                                  key={goal._id} 
                                  hover
                                  sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) } }}
                                >
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {goal.projectTitle}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {goal.teamId?.teamName || "No team"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {goal.managerId?.username || "N/A"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {getStatusChip(goal.status)}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {new Date(goal.dueDate).toLocaleDateString()}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Tasks Table */}
                <Grid item xs={12} lg={6}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ p: 3, pb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                          <AssignmentIcon color="primary" />
                          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                            Tasks Overview
                          </Typography>
                          <Chip
                            icon={<FilterListIcon />}
                            label={`${filteredTasks.length} of ${tasks.length}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        {/* Filters */}
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Project</InputLabel>
                            <Select
                              value={selectedProjectId}
                              label="Project"
                              onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                              <MenuItem value="">All Projects</MenuItem>
                              {uniqueProjects.map(project => (
                                <MenuItem key={project._id} value={project._id}>
                                  {project.projectTitle}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={selectedTaskStatus}
                              label="Status"
                              onChange={(e) => setSelectedTaskStatus(e.target.value)}
                            >
                              <MenuItem value="">All Status</MenuItem>
                              <MenuItem value="scheduled">Scheduled</MenuItem>
                              <MenuItem value="in-progress">In Progress</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                          </FormControl>
                        </Stack>
                      </Box>

                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                                Task
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                                Employee
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                                Status
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                                Priority
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredTasks.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                                  <Typography color="text.secondary">
                                    No tasks match your filters
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredTasks.map(task => (
                                <TableRow 
                                  key={task._id} 
                                  hover
                                  sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) } }}
                                >
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {task.taskTitle}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {task.projectId?.projectTitle || "No project"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {task.employeeId?.username || "Unassigned"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {getStatusChip(task.status)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={task.priority}
                                      size="small"
                                      color={
                                        task.priority === 'high' ? 'error' :
                                        task.priority === 'medium' ? 'warning' : 'default'
                                      }
                                      variant="outlined"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>
    </HRLayout>
  );
};

export default HRDashboard;