import { useState, useEffect, useCallback } from "react"; 
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Paper, CardActionArea, CardMedia, Grid, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, CircularProgress } from "@material-ui/core";
import image from "./bg.png";
import { DropzoneArea } from 'material-ui-dropzone';
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  clearButton: { 
    width: "100%", 
    borderRadius: "15px", 
    padding: "15px 22px", 
    color: "#000000a6", 
    fontSize: "20px", 
    fontWeight: 900 
  },
  mainContainer: { 
    backgroundImage: `url(${image})`, 
    backgroundRepeat: 'no-repeat', 
    backgroundPosition: 'center', 
    backgroundSize: 'cover', 
    height: "93vh", 
    marginTop: "8px" 
  },
  imageCard: { 
    margin: "auto", 
    maxWidth: 400, 
    height: 500, 
    backgroundColor: 'transparent', 
    boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%)', 
    borderRadius: '15px' 
  },
  loader: { color: '#be6a77 !important' },
  media: { height: 300, width: '100%', objectFit: 'cover' },
  tableCell: { 
    fontSize: '16px', 
    fontWeight: 'bold' 
  },
  errorMessage: {
    color: 'red',
    marginTop: theme.spacing(2),
    textAlign: 'center'
  }
}));

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendFile = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    let formData = new FormData();
    formData.append("file", selectedFile);

    try {
      console.log('Sending request to backend...');
      
      try {
        const pingRes = await axios.get("http://localhost:8001/ping");
        console.log("Backend ping response:", pingRes.data);
      } catch (pingError) {
        console.error("Backend ping failed:", pingError);
        throw new Error("Backend server is not responding. Please check if it's running.");
      }
      
      const res = await axios.post("http://localhost:8001/predict", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 second timeout
      });
      
      console.log('API Response:', res.data);
      if (res.status === 200) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Error details:", error);
      
      let errorMessage = "Error processing image. Please try again.";
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        errorMessage = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Is the backend running?";
      } else {
        console.error("Request setup error:", error.message);
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    sendFile();
  }, [selectedFile, sendFile]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setData(null);
      setError(null);
      return;
    }
    setSelectedFile(files[0]);
    setData(null);
    setError(null);
  };

  const clearData = () => {
    setData(null);
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get("http://localhost:8001/ping");
        console.log("Backend connected successfully");
      } catch (error) {
        console.error("Backend connection failed:", error);
        setError("Unable to connect to the backend server. Please make sure it's running.");
      }
    };
    
    checkBackend();
  }, []);

  return (
    <React.Fragment>
      <AppBar position="static" style={{ background: '#be6a77', boxShadow: 'none', color: 'white' }}>
        <Toolbar>
          <Typography variant="h6" noWrap>Potato Disease Classification by Ruchika </Typography>
          <div className={classes.grow} />
          {/* Logo has been removed from here */}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth={false} className={classes.mainContainer} disableGutters>
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} style={{ padding: "4em 1em 0 1em" }}>
          <Grid item xs={12}>
            <Card className={classes.imageCard}>
              {preview && (
                <CardActionArea>
                  <CardMedia 
                    className={classes.media} 
                    image={preview} 
                    component="img" 
                    title="Potato Leaf"
                  />
                </CardActionArea>
              )}
              
              {!preview && (
                <CardContent>
                  <DropzoneArea 
                    acceptedFiles={['image/*']} 
                    dropzoneText={"Drag & drop a potato leaf image"} 
                    onChange={onSelectFile}
                  />
                </CardContent>
              )}
              
              {isLoading && (
                <CardContent style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  flexDirection: 'column', 
                  alignItems: 'center' 
                }}>
                  <CircularProgress color="secondary" className={classes.loader} />
                  <Typography variant="h6">Processing...</Typography>
                </CardContent>
              )}
              
              {error && !isLoading && (
                <CardContent>
                  <Typography variant="body1" className={classes.errorMessage}>
                    {error}
                  </Typography>
                </CardContent>
              )}
              
              {data && !isLoading && !error && (
                <CardContent style={{ 
                  backgroundColor: 'white', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  flexDirection: 'column', 
                  alignItems: 'center' 
                }}>
                  <TableContainer component={Paper} style={{ backgroundColor: 'transparent' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.tableCell}>Label:</TableCell>
                          <TableCell className={classes.tableCell} align="right">Confidence:</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className={classes.tableCell}>{data.class}</TableCell>
                          <TableCell className={classes.tableCell} align="right">
                            {(parseFloat(data.confidence) * 100).toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}
            </Card>
          </Grid>
          
          {(preview || data || error) && (
            <Grid item style={{ maxWidth: "416px", width: "100%" }}>
              <Button 
                variant="contained" 
                className={classes.clearButton} 
                onClick={clearData}
              >
                Clear
              </Button>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};