import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Upload,
  ContentPaste,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';

const STEPS = ['Upload Data', 'Map Columns', 'Review & Import'];

const FIELD_OPTIONS = [
  { value: '', label: 'Skip Column' },
  { value: 'name', label: 'Item Name' },
  { value: 'category', label: 'Category' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'condition', label: 'Condition' },
  { value: 'buyPrice', label: 'Buy Price' },
  { value: 'sellPrice', label: 'Sell Price' },
  { value: 'notes', label: 'Notes' },
  { value: 'box', label: 'Has Box' },
  { value: 'instructions', label: 'Has Instructions' },
  { value: 'game', label: 'Has Game' },
  { value: 'inserts', label: 'Has Inserts' },
  { value: 'other', label: 'Has Other' },
];

const BulkImportInventory = () => {
  const navigate = useNavigate();
  const { addInventoryItem } = useInventory();
  
  const [activeStep, setActiveStep] = useState(0);
  const [csvData, setCsvData] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [importResults, setImportResults] = useState(null);
  const [errors, setErrors] = useState([]);

  // Parse CSV string into array of objects
  const parseCSV = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length === 0) return { headers: [], data: [] };

    // Detect delimiter (comma or tab)
    const delimiter = csvString.includes('\t') ? '\t' : ',';
    
    // Parse headers
    const headerLine = lines[0];
    const parsedHeaders = headerLine.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ''));
      if (values.length !== parsedHeaders.length) {
        setErrors((prev) => [
          ...prev,
          `Row ${i + 1}: Column count mismatch (expected ${parsedHeaders.length}, got ${values.length})`,
        ]);
        continue;
      }

      const row = {};
      parsedHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return { headers: parsedHeaders, data };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setCsvData(text);
      const { headers: parsedHeaders, data } = parseCSV(text);
      setHeaders(parsedHeaders);
      setParsedData(data);
      
      // Auto-map common column names
      const autoMapping = {};
      parsedHeaders.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') || lowerHeader.includes('title') || lowerHeader.includes('item')) {
          autoMapping[header] = 'name';
        } else if (lowerHeader.includes('category') || lowerHeader.includes('type')) {
          autoMapping[header] = 'category';
        } else if (lowerHeader.includes('quantity') || lowerHeader.includes('qty') || lowerHeader.includes('stock')) {
          autoMapping[header] = 'quantity';
        } else if (lowerHeader.includes('condition')) {
          autoMapping[header] = 'condition';
        } else if (lowerHeader.includes('buy') || lowerHeader.includes('cost') || lowerHeader.includes('purchase')) {
          autoMapping[header] = 'buyPrice';
        } else if (lowerHeader.includes('sell') || lowerHeader.includes('price') || lowerHeader.includes('retail')) {
          autoMapping[header] = 'sellPrice';
        } else if (lowerHeader.includes('note') || lowerHeader.includes('comment') || lowerHeader.includes('description')) {
          autoMapping[header] = 'notes';
        } else if (lowerHeader.includes('box')) {
          autoMapping[header] = 'box';
        } else if (lowerHeader.includes('instruction') || lowerHeader.includes('manual')) {
          autoMapping[header] = 'instructions';
        } else if (lowerHeader.includes('game') && !lowerHeader.includes('has')) {
          autoMapping[header] = 'game';
        } else if (lowerHeader.includes('insert')) {
          autoMapping[header] = 'inserts';
        } else if (lowerHeader.includes('other')) {
          autoMapping[header] = 'other';
        }
      });
      setColumnMapping(autoMapping);
      setActiveStep(1);
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setCsvData(text);
      const { headers: parsedHeaders, data } = parseCSV(text);
      setHeaders(parsedHeaders);
      setParsedData(data);
      
      // Auto-map columns
      const autoMapping = {};
      parsedHeaders.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') || lowerHeader.includes('title')) {
          autoMapping[header] = 'name';
        } else if (lowerHeader.includes('category')) {
          autoMapping[header] = 'category';
        } else if (lowerHeader.includes('quantity')) {
          autoMapping[header] = 'quantity';
        } else if (lowerHeader.includes('price')) {
          autoMapping[header] = 'sellPrice';
        }
      });
      setColumnMapping(autoMapping);
      setActiveStep(1);
    });
  };

  const handleMappingChange = (column, field) => {
    setColumnMapping((prev) => ({
      ...prev,
      [column]: field,
    }));
  };

  const handleImport = () => {
    setErrors([]);
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    parsedData.forEach((row, index) => {
      try {
        // Build item object from mapped columns
        const item = {
          name: '',
          category: 'Video Games',
          quantity: 1,
          condition: 'Good',
          completeness: {
            box: false,
            instructions: false,
            game: false,
            inserts: false,
            other: false,
          },
          buyPrice: '',
          sellPrice: '0',
          notes: '',
        };

        // Map columns to item fields
        Object.entries(columnMapping).forEach(([column, field]) => {
          if (!field || !row[column]) return;

          const value = row[column].trim();
          
          switch (field) {
            case 'name':
              item.name = value;
              break;
            case 'category':
              item.category = value;
              break;
            case 'quantity':
              item.quantity = parseInt(value, 10) || 1;
              break;
            case 'condition':
              item.condition = value;
              break;
            case 'buyPrice':
              item.buyPrice = value.replace(/[^0-9.]/g, '');
              break;
            case 'sellPrice':
              item.sellPrice = value.replace(/[^0-9.]/g, '') || '0';
              break;
            case 'notes':
              item.notes = value;
              break;
            case 'box':
            case 'instructions':
            case 'game':
            case 'inserts':
            case 'other':
              item.completeness[field] = 
                value.toLowerCase() === 'true' ||
                value.toLowerCase() === 'yes' ||
                value.toLowerCase() === '1' ||
                value.toLowerCase() === 'y' ||
                value === '✓' ||
                value === '✔';
              break;
          }
        });

        // Validate required fields
        if (!item.name) {
          throw new Error('Item name is required');
        }

        // Ensure game checkbox is checked if not specified
        if (!item.completeness.game && !Object.values(columnMapping).includes('game')) {
          item.completeness.game = true;
        }

        addInventoryItem(item);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${index + 2}: ${error.message}`);
      }
    });

    setImportResults(results);
    setActiveStep(2);
  };

  const handleReset = () => {
    setCsvData('');
    setParsedData([]);
    setHeaders([]);
    setColumnMapping({});
    setImportResults(null);
    setErrors([]);
    setActiveStep(0);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/inventory')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Bulk Import Inventory
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {errors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Parsing Warnings:
            </Typography>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2">
                {error}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Step 1: Upload Data */}
        {activeStep === 0 && (
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Upload CSV File or Paste Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload a CSV file or paste CSV data from your spreadsheet. The first row should contain column headers.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <input
                      accept=".csv,.txt"
                      style={{ display: 'none' }}
                      id="csv-upload"
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="csv-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<Upload />}
                        sx={{ mb: 2 }}
                      >
                        Upload CSV File
                      </Button>
                    </label>
                    <Typography variant="body2" color="text.secondary">
                      Select a .csv or .txt file from your computer
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ContentPaste />}
                      onClick={handlePaste}
                      sx={{ mb: 2 }}
                    >
                      Paste from Clipboard
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      Paste CSV data from your clipboard
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {csvData && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Preview (first 5 rows):
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {csvData.split('\n').slice(0, 6).join('\n')}
                    </pre>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Map Columns */}
        {activeStep === 1 && (
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Map Columns to Fields
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select which field each column should map to. Required fields: Item Name, Quantity, Sell Price
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>CSV Column</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Sample Value</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Map To Field</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {headers.map((header) => (
                      <TableRow key={header}>
                        <TableCell>{header}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {parsedData[0]?.[header] || '(empty)'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={columnMapping[header] || ''}
                            onChange={(e) => handleMappingChange(header, e.target.value)}
                          >
                            {FIELD_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => setActiveStep(0)}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleImport}
                  disabled={!columnMapping || Object.values(columnMapping).filter((v) => v === 'name').length === 0}
                >
                  Review & Import
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review Results */}
        {activeStep === 2 && importResults && (
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Import Results
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {importResults.success}
                    </Typography>
                    <Typography variant="body2">Items Imported</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: importResults.failed > 0 ? 'error.light' : 'grey.100' }}>
                    <ErrorIcon sx={{ fontSize: 40, color: importResults.failed > 0 ? 'error.main' : 'grey.400', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: importResults.failed > 0 ? 'error.main' : 'grey.600' }}>
                      {importResults.failed}
                    </Typography>
                    <Typography variant="body2">Failed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {parsedData.length}
                    </Typography>
                    <Typography variant="body2">Total Rows</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {importResults.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Import Errors:
                  </Typography>
                  {importResults.errors.map((error, index) => (
                    <Typography key={index} variant="body2">
                      {error}
                    </Typography>
                  ))}
                </Alert>
              )}

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={handleReset}>
                  Import More
                </Button>
                <Button variant="contained" onClick={() => navigate('/dashboard/inventory')}>
                  View Inventory
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default BulkImportInventory;

