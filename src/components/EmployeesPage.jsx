import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Badge,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EmployeesPage = () => {
  const navigate = useNavigate();

  const employeesData = [
    { id: 1, name: 'Alex Martinez', role: 'Store Manager', email: 'alex.m@mystore.com', status: 'Active' },
    { id: 2, name: 'Jordan Taylor', role: 'Sales Associate', email: 'jordan.t@mystore.com', status: 'Active' },
    { id: 3, name: 'Casey Brown', role: 'Sales Associate', email: 'casey.b@mystore.com', status: 'Active' },
    { id: 4, name: 'Riley Anderson', role: 'Inventory Specialist', email: 'riley.a@mystore.com', status: 'Active' },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Employees
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Badge sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Employee List
              </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeesData.map((employee) => (
                    <TableRow key={employee.id} hover>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={employee.status}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default EmployeesPage;

