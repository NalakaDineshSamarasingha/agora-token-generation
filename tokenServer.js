const express = require('express');
const bodyParser = require('body-parser');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();
app.use(bodyParser.json());

const APP_ID = '32f8dd6fbfad4a18986c278345678b41';
const APP_CERTIFICATE = 'ed981005f043484cbb82b80105f9e581';
const EXPIRE_TIME = 3600; // 1 hour

app.post('/generateToken', (req, res) => {
  try {
    const { channelName, uid } = req.body;
    if (!channelName || !uid) {
      return res.status(400).json({ error: 'channelName and uid are required' });
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + EXPIRE_TIME;

    // uid can be string or number, convert accordingly
    let userId = 0;
    if (typeof uid === 'string' && /^\d+$/.test(uid)) {
      userId = Number(uid);
    } else if (typeof uid === 'number') {
      userId = uid;
    } else {
      // For string uids that are not numeric, Agora expects string tokens, use 0 here and pass string uid separately if supported by SDK
      userId = 0;
    }

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      userId,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    return res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Token server running on port ${PORT}`);
});
