const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 9000;
app.use(cors());
app.use(express.json());

const {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} = require("agora-access-token");
const { uuid } = require("uuidv4");

app.get("/", (req, res) => {
  res.json("HEllo");
});
console.log(uuid());

app.post("/getToken", async (req, res) => {
  console.log(req.body);
  const appId = "cdce489f622c47c7ab47108c2fd89ddd";
  const appCertificate = "bfcdc244d41b417b917020dbde537920";
  const channelName = "One";
  const uid = uuid();
  const userAccount = "User account";
  const role = RtmRole.Rtm_User;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const tokenA = RtmTokenBuilder.buildToken(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  console.log("Token with integer number Uid: " + tokenA);

  res.send({ token: tokenA, channelName, uid });
});

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
