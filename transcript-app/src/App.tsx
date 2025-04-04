import { useState, useEffect } from 'react'
import { Typography, Container, TextField, Button, Paper, TableContainer, Table, TableHead, TableCell, TableRow, TableBody, Popover, Tabs, Tab } from '@mui/material'
import axios from 'axios'
import "./App.css"


interface MeetingType {
  id: number;
  recall_id: string;
  url: string;
  created_at: string;
}

interface TranscriptType {
  speaker: string;
  text: string;
}

interface TabProps {
  index: number
}

function PastTranscripts(props: TabProps) {
  const { index } = props;
  const [meetings, setMeetings] = useState<MeetingType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);

  const getTranscript = async (id: string) => {
    try {
      const res = await axios.post("http://localhost:3000/transcript", {
        meetingId: id
      });
      setTranscript(res.data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    axios.get<MeetingType[]>("http://localhost:3000/meetings").then((response) => setMeetings(response.data)).catch((e) => console.error(e));
  })
  return (
    <Container hidden={index != 1}>      
      <Paper>
        <Typography variant='h6'>Recent Transcripts</Typography>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant='subtitle1'>Created At</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle1'>Meeting</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle1'>Transcript</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                meetings.map((value) => {
                  return(
                    <TableRow>
                      <TableCell>
                        {value.created_at}
                      </TableCell>
                      <TableCell>
                        {value.url}
                      </TableCell>
                      <TableCell>
                        <Button variant='outlined' onClick={() => getTranscript(value.recall_id)}>Get Transcript</Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </TableContainer>       
      </Paper>
      <Popover open={transcript.length != 0} anchorOrigin={{horizontal: 'center', vertical: 'top'}}>
        <Button onClick={() => setTranscript([])}>Close</Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant='h6'>Speaker</Typography></TableCell>
                <TableCell><Typography variant='h6'>Text</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {
              transcript?.map((value) => {
                return (
                  <TableRow>
                    <TableCell>{value.speaker}</TableCell>
                    <TableCell>{value.text}</TableCell>
                  </TableRow>  
                )
              })
            }
            </TableBody>
          </Table>
        </TableContainer>
      </Popover>
    </Container>
  )
};

function NewTranscript(props: TabProps) {
  const { index } = props;
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [hideSuccess, setHideSucess] = useState(true);
  const createBot = async () => {
    setDisabled(true);
    try {
      await axios.post<MeetingType>("http://localhost:3000/create", {
        meetingUrl: url
      });
      setUrl("");
    } catch(e) {
      console.error(e);
    }
    setDisabled(false);
    setHideSucess(false);
  };

  useEffect( () => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTranscript((prev) => [...prev, data]);
    };

    return () => {
      socket.close();
    };
  });
  return (
    <Container hidden={index != 0}>
      <Container style={{display: 'flex', flexDirection: 'row', marginTop: '20px', marginBottom: '20px'}}>
        <TextField type='text' fullWidth value={url} onChange={(e) => setUrl(e.target.value)} label="Google Meet Url" variant='outlined'/>
        <Button onClick={createBot} disabled={disabled}>Create Bot</Button>
      </Container>
      <Typography hidden={hideSuccess} variant='body1'style={{color: 'green'}}>Success! Your bot is on its way to your meeting.</Typography>

      <Paper style={{marginTop: '20px'}}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant='h6'>Speaker</Typography></TableCell>
                <TableCell><Typography variant='h6'>Text</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {
              transcript?.map((value) => {
                return (
                  <TableRow>
                    <TableCell>{value.speaker}</TableCell>
                    <TableCell>{value.text}</TableCell>
                  </TableRow>  
                )
              })
            }
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
};

function App() {
  const [currTab, setCurrTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrTab(newValue);
  };


  return (
    <Container>
      <Container>
        <Typography variant='h4'>Recall Transcript App</Typography>
        <Typography variant='body1'>Welcome! Use this app to create Recall bots for Google Meets, view live transcripts, and search transcripts from finished meetings.</Typography>
      </Container>
      <Tabs value={currTab} onChange={handleTabChange}>
        <Tab value={0} label="New Transcript" />
        <Tab value={1} label="Past Transcripts" />
      </Tabs>
      <NewTranscript index={currTab}/>
      <PastTranscripts index={currTab} />
    </Container>
  )
}

export default App
