import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Fab,
  useTheme,
  useMediaQuery,
  Paper,
  Slide,
  Fade,
  Grow
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayArrowIcon,
  People as PeopleIcon,
  TrackChanges as TrackChangesIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Star as StarIcon,
  BarChart as BarChartIcon,
  FlashOn as FlashOnIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4',
    },
    secondary: {
      main: '#0c4672',
    },
    background: {
      default: '#040B1A',
      paper: '#0A1628',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '25px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          background: 'rgba(10, 22, 40, 0.3)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

const RevXHomepage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 100, 
        y: (e.clientY / window.innerHeight) * 100 
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: PeopleIcon,
      title: "Team Management",
      description: "Streamline team coordination and performance tracking with advanced analytics",
      gradient: "linear-gradient(45deg, #0c4672, #00bcd4)"
    },
    {
      icon: TrackChangesIcon,
      title: "Goal Setting", 
      description: "Set, track, and achieve meaningful objectives with smart goal frameworks",
      gradient: "linear-gradient(45deg, #00bcd4, #4dd0e1)"
    },
    {
      icon: TrendingUpIcon,
      title: "Performance Analytics",
      description: "Data-driven insights for continuous improvement and growth",
      gradient: "linear-gradient(45deg, #0c4672, #1976d2)"
    },
    {
      icon: EmojiEventsIcon,
      title: "Recognition System",
      description: "Celebrate achievements and motivate teams with meaningful rewards",
      gradient: "linear-gradient(45deg, #00bcd4, #0c4672)"
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', icon: PeopleIcon },
    { value: '98%', label: 'Satisfaction', icon: StarIcon },
    { value: '500+', label: 'Companies', icon: FlashOnIcon },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* Dynamic Background */}
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(12, 70, 114, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(0, 188, 212, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(12, 70, 114, 0.2) 0%, transparent 50%),
              radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(0, 188, 212, 0.15) 0%, transparent 50%),
              radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(12, 70, 114, 0.15) 0%, transparent 50%),
              linear-gradient(135deg, #040B1A 0%, #0A1628 25%, #0c4672 50%, #083250 75%, #040B1A 100%)
            `,
            transition: 'all 0.3s ease-out',
          }}
        />

        {/* Floating Orbs */}
        <Box
          sx={{
            position: 'fixed',
            top: '25%',
            left: '25%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(60px)',
            background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
            animation: 'float 20s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '33%': { transform: 'translateY(-20px) rotate(120deg)' },
              '66%': { transform: 'translateY(-10px) rotate(240deg)' },
            },
          }}
        />
        
        <Box
          sx={{
            position: 'fixed',
            bottom: '25%',
            right: '25%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(40px)',
            background: 'linear-gradient(135deg, #00bcd4, #0c4672)',
            animation: 'floatReverse 25s ease-in-out infinite',
            '@keyframes floatReverse': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '33%': { transform: 'translateY(20px) rotate(-120deg)' },
              '66%': { transform: 'translateY(10px) rotate(-240deg)' },
            },
          }}
        />

        {/* Navigation */}
        <Slide direction="down" in={true}>
          <AppBar 
            position="fixed" 
            elevation={0}
            sx={{
              background: scrollY > 50 
                ? 'rgba(10, 22, 40, 0.95)' 
                : 'transparent',
              backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
              borderBottom: scrollY > 50 
                ? '1px solid rgba(0, 188, 212, 0.3)' 
                : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <Toolbar sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                    mr: 2,
                    borderRadius: 3,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  R
                </Avatar>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #ffffff, #00bcd4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  RevX
                </Typography>
              </Box>

              {!isMobile ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button color="inherit" sx={{ '&:hover': { color: '#00bcd4' } }}>
                    Contact
                  </Button>
                  <IconButton color="inherit" sx={{ '&:hover': { color: '#00bcd4' } }}>
                    <SearchIcon />
                  </IconButton>
                  <IconButton color="inherit" sx={{ '&:hover': { color: '#00bcd4' } }}>
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <Link href="/auth/signin" passHref>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                      px: 4,
                      py: 1.5,
                      borderRadius: '25px',
                      '&:hover': {
                        transform: 'scale(1.05) translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(12, 70, 114, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                   <Typography sx={{ color: '#ffffff' }}>Sign In</Typography>
                    
                  </Button></Link>
                </Box>
              ) : (
                <IconButton
                  color="inherit"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              )}
            </Toolbar>
          </AppBar>
        </Slide>

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{
            sx: {
              background: 'rgba(10, 22, 40, 0.95)',
              backdropFilter: 'blur(20px)',
              width: '300px',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <List>
              <ListItem button>
                <ListItemText primary="Contact" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 2 }}>
                <Link href="/auth/signin" passHref>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                    py: 1.5,
                    borderRadius: '25px',
                  }}
                >
                  Sign In
                </Button>
                </Link>

              </ListItem>
            </List>
          </Box>
        </Drawer>

        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: { xs: 12, md: 16 }, pb: 8 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left Content */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ space: 4 }}>
                <Fade in={true} timeout={1000}>
                  <Chip
                    label="✨ Performance Management Reimagined"
                    sx={{
                      background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                      color: 'white',
                      border: '1px solid rgba(0, 188, 212, 0.3)',
                      mb: 4,
                      py: 2,
                      px: 1,
                    }}
                  />
                </Fade>

                <Slide direction="up" in={true} timeout={1200}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                      fontWeight: 'bold',
                      lineHeight: 1.1,
                      background: 'linear-gradient(45deg, #ffffff, #00bcd4, #0c4672)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 40px rgba(0, 188, 212, 0.3))',
                      mb: 4,
                    }}
                  >
                    Welcome to RevX
                  </Typography>
                </Slide>

                <Fade in={true} timeout={1500}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      mb: 6,
                      maxWidth: '600px',
                    }}
                  >
                    Empower employees, managers, and HR professionals to effectively manage
                    employee performance, conduct performance reviews, set actionable goals,
                    and provide valuable feedback to drive continuous improvement.
                  </Typography>
                </Fade>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 6 }}>
                  <Link href="/auth/signin" passHref>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                      px: 4,
                      py: 2,
                      borderRadius: '25px',
                      fontSize: '1.1rem',
                      '&:hover': {
                        transform: 'scale(1.05) translateY(-2px)',
                        boxShadow: '0 16px 50px rgba(12, 70, 114, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Get Started
                  </Button>
                  </Link>
                </Box>

                {/* Stats */}
                <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', pt: 4 }}>
                  <Grid container spacing={4}>
                    {stats.map((stat, index) => {
                      const IconComponent = stat.icon;
                      return (
                        <Grid item xs={4} key={stat.label}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Grow
                              in={animateStats}
                              timeout={700}
                              style={{ transitionDelay: `${index * 200}ms` }}
                            >
                              <Avatar
                                sx={{
                                  width: 64,
                                  height: 64,
                                  background: `linear-gradient(45deg, ${index % 2 ? '#0c4672' : '#00bcd4'}, ${index % 2 ? '#00bcd4' : '#0c4672'})`,
                                  mx: 'auto',
                                  mb: 2,
                                }}
                              >
                                <IconComponent sx={{ fontSize: 28 }} />
                              </Avatar>
                            </Grow>
                            <Fade
                              in={animateStats}
                              timeout={700}
                              style={{ transitionDelay: `${index * 200 + 200}ms` }}
                            >
                              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {stat.value}
                              </Typography>
                            </Fade>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {stat.label}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* Right Card */}
            <Grid item xs={12} lg={6}>
              <Slide direction="left" in={true} timeout={1000}>
                <Card
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(12, 70, 114, 0.2), rgba(0, 188, 212, 0.1))',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 32px 80px rgba(12, 70, 114, 0.3)',
                  }}
                >
                  {/* Card Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                        mr: 2,
                        borderRadius: 4,
                      }}
                    >
                      <BarChartIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Performance Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Real-time insights and analytics
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress Indicators */}
                  <Box sx={{ space: 3, mb: 4 }}>
                    {[
                      { label: 'Team Performance', value: 85, color: '#4A90A4' },
                      { label: 'Goal Achievement', value: 90, color: '#00bcd4' },
                      { label: 'Feedback Quality', value: 95, color: '#4CAF50' },
                    ].map((item, index) => (
                      <Box key={item.label} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.label}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: item.color }}
                          >
                            {item.value}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={animateStats ? item.value : 0}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              backgroundColor: item.color,
                              transition: 'transform 1s ease-out',
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>

                  {/* Team Members */}
                  <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', pt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AvatarGroup max={5} sx={{ mr: 2 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Avatar
                            key={i}
                            sx={{
                              background: `linear-gradient(45deg, ${
                                i % 2 ? '#0c4672' : '#00bcd4'
                              }, ${i % 2 ? '#00bcd4' : '#4dd0e1'})`,
                              border: '2px solid rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            {String.fromCharCode(64 + i)}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          24 team members
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last updated 2 min ago
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Slide>
            </Grid>
          </Grid>
        </Container>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 10 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 'bold',
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff, #00bcd4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Powerful Features for Modern Teams
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Everything you need to build a high-performing organization with cutting-edge tools
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Grid item xs={12} sm={6} lg={3} key={feature.title}>
                  <Grow in={true} timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Card
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        height: '100%',
                        transition: 'all 0.5s ease',
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.05)',
                          boxShadow: '0 20px 60px rgba(12, 70, 114, 0.3)',
                          borderColor: 'rgba(0, 188, 212, 0.3)',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          background: feature.gradient,
                          mx: 'auto',
                          mb: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(12deg)',
                          },
                        }}
                      >
                        <IconComponent sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </Card>
                  </Grow>
                </Grid>
              );
            })}
          </Grid>
        </Container>

        {/* Footer */}
        <Paper
          component="footer"
          sx={{
            position: 'relative',
            zIndex: 10,
            background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.9), rgba(12, 70, 114, 0.3))',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            py: 6,
            mt: 8,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                    mr: 2,
                    borderRadius: 3,
                  }}
                >
                  R
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  RevX
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                © 2025 RevX. All rights reserved.
              </Typography>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Button size="small" color="inherit" sx={{ '&:hover': { color: '#00bcd4' } }}>
                  Privacy Policy
                </Button>
                <Button size="small" color="inherit" sx={{ '&:hover': { color: '#00bcd4' } }}>
                  Terms of Service
                </Button>
              </Box>
            </Box>
          </Container>
        </Paper>

        {/* Scroll to Top Button */}
        {scrollY > 400 && (
          <Fade in={true}>
            <Fab
              onClick={scrollToTop}
              sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 32px rgba(12, 70, 114, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <KeyboardArrowUpIcon />
            </Fab>
          </Fade>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default RevXHomepage;