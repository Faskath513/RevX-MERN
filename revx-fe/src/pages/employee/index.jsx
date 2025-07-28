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
  CircularProgress,
  Stack,
  Badge,
  Divider,
  Fade,
  Grow,
  useTheme,
  alpha
} from '@mui/material';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import EmployeeLayout from '../../components/EmployeeLayout';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#2196f3', '#f44336'];

const StatCard = ({ title, value, icon, color, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Grow in timeout={1000 + delay}>
      <Card 
        elevation={0}
        sx={{ 
          borderLeft: `6px solid ${color}`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
            borderLeft: `8px solid ${color}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          }
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box 
              sx={{ 
                color,
                background: alpha(color, 0.1),
                borderRadius: '16px',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{ 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem'
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mt: 0.5
                }}
              >
                {value}
              </Typography>
            </Box>
            <TrendingUpIcon sx={{ color: alpha(color, 0.6), fontSize: 20 }} />
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ color: payload[0].payload.fill }}>
          {payload[0].value} tasks
        </Typography>
      </Paper>
    );
  }
  return null;
};

const EmployeeDashboard = () => {
  const { user, isAuthenticated } = useAuth();
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
        const tasksResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const profilePicResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}/profile-picture`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            responseType: 'blob'
          }
        );

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

  const taskStats = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const taskData = [
    { name: 'Completed', value: taskStats.completed || 0, fill: '#4caf50' },
    { name: 'In Progress', value: taskStats['in-progress'] || 0, fill: '#2196f3' },
    { name: 'Pending', value: taskStats.scheduled || 0, fill: '#f44336' },
  ];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <EmployeeLayout>
      <Box sx={{ 
        px: { xs: 2, md: 4 }, 
        py: 4, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>

        {/* Enhanced Gradient Header */}
        <Fade in timeout={800}>
          <Card
            elevation={0}
            sx={{
              mb: 4,
              background: 'linear-gradient(135deg, #0c4672 0%, #00bcd4 100%)',
              color: 'white',
              overflow: 'hidden',
              position: 'relative',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(12, 70, 114, 0.3)',
            }}
          >
            {/* Animated Background Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 6s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-20px)' },
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 4s ease-in-out infinite reverse',
              }}
            />
            
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack direction="row" alignItems="center" spacing={3} mb={3}>
                    <Box
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '20px',
                        p: 2,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <DashboardIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        Employee Dashboard
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Your productivity at a glance
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Box sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: 3, 
                    p: 3,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Welcome back, {user?.username}!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: '#4caf50',
                          border: '4px solid white',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                        }}
                      />
                    }
                  >
                    <Avatar
                      src={imagePreview || '/default-avatar.png'}
                      sx={{
                        width: 140,
                        height: 140,
                        border: '6px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                  </Badge>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Enhanced Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Tasks"
              value={tasks.length}
              icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
              color="#607d8b"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed"
              value={taskStats.completed || 0}
              icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
              color="#4caf50"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="In Progress"
              value={taskStats['in-progress'] || 0}
              icon={<HourglassEmptyIcon sx={{ fontSize: 32 }} />}
              color="#2196f3"
              delay={400}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending"
              value={taskStats.scheduled || 0}
              icon={<PendingActionsIcon sx={{ fontSize: 32 }} />}
              color="#f44336"
              delay={600}
            />
          </Grid>
        </Grid>

        {/* Enhanced Task Distribution Chart */}
        <Grow in timeout={1200}>
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #0c4672 0%, #00bcd4 100%)',
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #0c4672 0%, #00bcd4 100%)',
                  borderRadius: '12px',
                  p: 1.5,
                  color: 'white'
                }}
              >
                <AssignmentIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  Task Status Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overview of your current workload
                </Typography>
              </Box>
            </Stack>
            
            <Divider sx={{ mb: 3, background: alpha('#0c4672', 0.1) }} />
            
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={taskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  innerRadius={60}
                  strokeWidth={3}
                  stroke="#ffffff"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grow>
      </Box>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;