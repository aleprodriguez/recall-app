import express from 'express';
import cors from 'cors';
import { getRecents, create } from './services/MeetingService';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';

dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

interface CreateRequest {
    meetingUrl: string;
};

interface TranscriptRequest {
    meetingId: string;
};

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
    console.log('Client connected');
  
    socket.on('message', (message) => {
      console.log('Received:', message.toString());
      socket.send('Got your message!');
    });
});

const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
};

app.post("/webhook", (req, res) => {
    const eventData = req.body;
    console.log("Received webhook:", eventData);
  
    // Broadcast to all connected WebSocket clients
    const transcriptData = {speaker: eventData.data.data.participant.name, text: eventData.data.data.words[0].text}
    broadcast(transcriptData);
  
    res.status(200).send("Webhook received");
});

app.post("/create", async(req, res) => {
    const body = req.body as CreateRequest;
    if (!body.meetingUrl) {
        res.status(500).send("No meeting url provided."); 
        return;
    }
    const recallRes = await fetch(`https://${process.env.RECALL_AI_REGION ?? "region"}.recall.ai/api/v1/bot/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.RECALL_AI_API_KEY || "key"}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            meeting_url: body.meetingUrl,
            recording_config: {
                transcript: {
                    provider: {
                        meeting_captions: {},
                        
                    }
                },
                realtime_endpoints: [
                    {
                        type: "webhook",
                        url: process.env.WEBHOOK_URL,
                        events: ["transcript.data"]
                    }
                ]
            },
            
        })
    }).then((response) => response.json())
    .catch((e) => {
        console.error(e);
        res.status(500).send(`Bot creation failed: ${e}`);
        return;
    });
    const newMeeting = await create(recallRes.id, body.meetingUrl);
    res.status(200).send(recallRes);
});

app.get("/meetings", async (req, res) => {
    const meetings = await getRecents();
    res.status(200).send(meetings);
});

app.post("/transcript", async(req, res) => {
    const body = req.body as TranscriptRequest;
    if (!body.meetingId) {
        res.status(500).send("No meeting id provided."); 
        return;
    }

    const transcriptRes = await fetch(`https://${process.env.RECALL_AI_REGION}.recall.ai/api/v1/bot/${body.meetingId}/transcript/`, {
        method: 'GET',
        headers: {
            'Authorization': `${process.env.RECALL_AI_API_KEY || "key"}`,
            'Accept': 'application/json'
        },
    }).then((response) => response.json())
    .catch((e) => {
        console.error(e);
        res.status(500).send(`Get transcript failed: ${e}`);
        return;
    })

    res.status(200).send(transcriptRes.map((obj: any) => { return {speaker: obj.speaker, text: obj.words[0].text}}));
});