import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Stack,
  CircularProgress,
  Badge,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import ManagerLayout from '../../components/ManagerLayout';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#2196f3', '#f44336', '#ff9800'];
const GOAL_COLORS = ['#4caf50', '#2196f3', '#f44336'];

// Enhanced StatCard component with animations and better design
const StatCard = ({ title, value, icon, color, subtitle, trend, isLoading }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(color, 0.2)}`,
          '& .stat-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          }
        }
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          opacity: 0.6,
        }}
      />
      
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              {title}
            </Typography>
            
            {isLoading ? (
              <CircularProgress size={24} sx={{ color }} />
            ) : (
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ color, lineHeight: 1 }}
                >
                  {value}
                </Typography>
                {trend && (
                  <Chip
                    label={trend}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      backgroundColor: trend.startsWith('+') ? '#4caf5020' : '#f4433620',
                      color: trend.startsWith('+') ? '#4caf50' : '#f44336',
                      fontWeight: 600
                    }}
                  />
                )}
              </Stack>
            )}
            
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              {subtitle}
            </Typography>
          </Box>
          
          <Box 
            className="stat-icon"
            sx={{ 
              color,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              p: 1,
              borderRadius: 2,
              background: `${color}15`
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 60, strokeWidth = 6, color = '#4caf50' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          sx={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="caption" fontWeight="bold" color={color}>
          {progress}%
        </Typography>
      </Box>
    </Box>
  );
};

const ManagerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Please login to view dashboard');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const goalsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const tasksResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/all/`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const profilePicResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}/profile-picture`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            responseType: 'blob'
          }
        );

        setGoals(goalsResponse.data);
        setTasks(tasksResponse.data);
        setImagePreview(URL.createObjectURL(profilePicResponse.data));
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated]);

  const goalStats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in-progress').length,
    scheduled: goals.filter(g => g.status === 'scheduled').length
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => t.status === 'scheduled').length
  };

  const goalChartData = [
    { status: 'Completed', count: goalStats.completed, color: '#4caf50' },
    { status: 'In Progress', count: goalStats.inProgress, color: '#2196f3' },
    { status: 'Scheduled', count: goalStats.scheduled, color: '#ff9800' }
  ];

  const taskChartData = [
    { name: 'Completed', value: taskStats.completed, color: '#4caf50' },
    { name: 'In Progress', value: taskStats.inProgress, color: '#2196f3' },
    { name: 'Scheduled', value: taskStats.overdue, color: '#f44336' }
  ];

  const goalsByManager = goals.reduce((acc, goal) => {
    if (goal.manager_id) acc[goal.manager_id] = true;
    return acc;
  }, {});

  const completionRate = goals.length > 0 ? Math.round((goalStats.completed / goals.length) * 100) : 0;

  if (loading) {
    return (
      <ManagerLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </ManagerLayout>
    );
  }

  if (error) {
    return (
      <ManagerLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography color="error" variant="h6" textAlign="center">
            {error}
          </Typography>
        </Container>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <Box sx={{ 
        bgcolor: '#f8fafc', 
        minHeight: '100vh',
        backgroundImage: 'radial-gradient(circle at 25% 25%, #e3f2fd 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f3e5f5 0%, transparent 50%)'
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          
          {/* Enhanced Header with Glassmorphism Effect */}
          <Card 
            elevation={0}
            sx={{ 
              mb: 4,
              background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
              color: 'white',
              overflow: 'hidden',
              position: 'relative',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(12, 70, 114, 0.3)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(10px)',
              }
            }}
          >
            {/* Animated background elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 6s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                  '50%': { transform: 'translateY(-20px) rotate(180deg)' }
                }
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 8s ease-in-out infinite reverse',
              }}
            />

            <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack direction="row" alignItems="center" spacing={3} mb={3}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <DashboardIcon sx={{ fontSize: 48 }} />
                    </Box>
                    <Box>
                      <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
                        Manager Dashboard
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                        Real-time insights and analytics
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Typography variant="h5" sx={{ opacity: 0.95, fontWeight: 600 }}>
                      Welcome back, {user?.username}!
                    </Typography>
                    <Chip
                      label="Online"
                      size="small"
                      sx={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Stack>
                  
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    {user?.email}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Tooltip title="Active">
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              backgroundColor: '#4caf50',
                              border: '4px solid white',
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                                '70%': { boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                              }
                            }}
                          />
                        </Tooltip>
                      }
                    >
                      <Avatar
                        src={imagePreview || '/default-avatar.png'}
                        sx={{ 
                          width: 140, 
                          height: 140, 
                          border: '6px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </Badge>
                    
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.25)',
                        }
                      }}
                    >
                      <NotificationsIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Enhanced Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Goals"
                value={goals.length}
                icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
                color="#4caf50"
                subtitle="Active project goals"
                trend="+12%"
                isLoading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Tasks"
                value={tasks.length}
                icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
                color="#2196f3"
                subtitle="All task assignments"
                trend="+8%"
                isLoading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Managers"
                value={Object.keys(goalsByManager).length}
                icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                color="#ff9800"
                subtitle="Managing projects"
                trend="+3%"
                isLoading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completion Rate"
                value={`${completionRate}%`}
                icon={<TimelineIcon sx={{ fontSize: 32 }} />}
                color="#9c27b0"
                subtitle="Overall progress"
                trend="+5%"
                isLoading={loading}
              />
            </Grid>
          </Grid>

          {/* Progress Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e3f2fd',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Goal Progress Overview
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={4} textAlign="center">
                      <ProgressRing progress={completionRate} color="#4caf50" />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Completed
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Stack spacing={2}>
                        <Box>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                              <Typography variant="body2">Completed</Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="bold">{goalStats.completed}</Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={(goalStats.completed / Math.max(goalStats.total, 1)) * 100}
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: '#e8f5e8',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#4caf50',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                        
                        <Box>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PendingIcon sx={{ color: '#2196f3', fontSize: 16 }} />
                              <Typography variant="body2">In Progress</Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="bold">{goalStats.inProgress}</Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={(goalStats.inProgress / Math.max(goalStats.total, 1)) * 100}
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: '#e3f2fd',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#2196f3',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                        
                        <Box>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <ScheduleIcon sx={{ color: '#ff9800', fontSize: 16 }} />
                              <Typography variant="body2">Scheduled</Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="bold">{goalStats.scheduled}</Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={(goalStats.scheduled / Math.max(goalStats.total, 1)) * 100}
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: '#fff3e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#ff9800',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e3f2fd',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Task Distribution
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={taskChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={40}
                        paddingAngle={5}
                      >
                        {taskChartData.map((entry, index) => (
                          <Cell key={`task-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                    {taskChartData.map((entry, index) => (
                      <Stack key={entry.name} direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: entry.color
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {entry.name}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Enhanced Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e3f2fd',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Goals Progress Analytics
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label="Weekly" size="small" variant="outlined" />
                    <Chip label="Monthly" size="small" />
                  </Stack>
                </Stack>
                
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={goalChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      {goalChartData.map((entry, index) => (
                        <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.3}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="status" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[8, 8, 0, 0]}
                      fill="url(#gradient-0)"
                    >
                      {goalChartData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={`url(#gradient-${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e3f2fd',
                  height: 'fit-content'
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Quick Stats
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Goals Completion
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="#4caf50">
                        {completionRate}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={completionRate}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#e8f5e8',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50',
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Task Progress
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="#2196f3">
                        {tasks.length > 0 ? Math.round((taskStats.completed / tasks.length) * 100) : 0}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={tasks.length > 0 ? (taskStats.completed / tasks.length) * 100 : 0}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#e3f2fd',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#2196f3',
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                  
                  <Divider />
                  
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Recent Activity
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                          <CheckCircleIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {goalStats.completed} goals completed
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            This month
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3' }}>
                          <PendingIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {goalStats.inProgress} goals in progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active now
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff9800' }}>
                          <PeopleIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {Object.keys(goalsByManager).length} active managers
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Currently managing
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Additional Analytics Section */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e3f2fd',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="between" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Performance Trends
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label="Last 7 days" 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 600
                      }} 
                    />
                  </Stack>
                </Stack>
                
                {/* Mock trend data for demonstration */}
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart 
                    data={[
                      { day: 'Mon', goals: 12, tasks: 25 },
                      { day: 'Tue', goals: 15, tasks: 28 },
                      { day: 'Wed', goals: 18, tasks: 32 },
                      { day: 'Thu', goals: 14, tasks: 29 },
                      { day: 'Fri', goals: 20, tasks: 35 },
                      { day: 'Sat', goals: 16, tasks: 30 },
                      { day: 'Sun', goals: 22, tasks: 38 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="goalsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2196f3" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="goals"
                      stroke="#4caf50"
                      strokeWidth={3}
                      fill="url(#goalsGradient)"
                      name="Goals"
                    />
                    <Area
                      type="monotone"
                      dataKey="tasks"
                      stroke="#2196f3"
                      strokeWidth={3}
                      fill="url(#tasksGradient)"
                      name="Tasks"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                <Stack direction="row" spacing={4} justifyContent="center" mt={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#4caf50'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Goals Completed
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#2196f3'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Tasks Completed
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ManagerLayout>
  );
};

export default ManagerDashboard;