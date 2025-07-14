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
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ManagerLayout from '../../components/ManagerLayout';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#2196f3', '#f44336']; // Green, Blue, Red
const GOAL_COLORS = ['#4caf50', '#2196f3', '#f44336'];

const ManagerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Please login to view dashboard');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch manager's goals
        const goalsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        // Fetch manager's tasks
        const tasksResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/all/`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        // Fetch profile picture
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

  // Process data for visualizations
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

  // Data for charts
  const goalChartData = [
    { status: 'Completed', count: goalStats.completed },
    { status: 'In Progress', count: goalStats.inProgress },
    { status: 'Scheduled', count: goalStats.scheduled }
  ];

  const taskChartData = [
    { name: 'Completed', value: taskStats.completed },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'scheduled', value: taskStats.overdue }
  ];

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <ManagerLayout>
      <Box sx={{ padding: 4, minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
        {/* Header Section */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              Welcome, {user?.username}!
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {user?.email}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={imagePreview || '/default-avatar.png'}
              sx={{ width: 120, height: 120, boxShadow: 3 }}
            />
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {['Total Goals', 'Completed Goals', 'In-Progress Goals', 'Total Tasks'].map((title, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{title}</Typography>
                  <Typography variant="h3">
                    {[
                      goalStats.total,
                      goalStats.completed,
                      goalStats.inProgress,
                      taskStats.total
                    ][index]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Goals Progress Chart */}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Goals Progress</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {goalChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GOAL_COLORS[index % GOAL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Task Distribution Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Task Status Distribution</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {taskChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </ManagerLayout>
  );
};

export default ManagerDashboard;
