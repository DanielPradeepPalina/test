import React, {useRef, useState, useEffect} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  RtcConnection,
} from 'react-native-agora';
import * as config from './config';
import {Buffer} from 'buffer';

const VideoCalls = () => {
  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState(''); // Message to the user

  // streamData
  const [syncWithAudio, setSyncWithAudio] = useState<boolean>(false);
  const [ordered, setOrdered] = useState<boolean>(false);
  const [data, setData] = useState<string>('');
  const [streamId, setStreamId] = useState<any>(undefined);

  const showMessage = (msg: string) => {
    setMessage(msg);
  };

  useEffect(() => {
    // Initialize Agora engine when the app starts
    setupVideoSDKEngine();
  });

  const setupVideoSDKEngine = async () => {
    try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          console.log('JOINED>>>>>');
          showMessage(
            'Successfully joined the channel ' + config.default.channelId,
          );
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
          console.log(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setRemoteUid(0);
        },
      });
      agoraEngine.initialize({
        appId: config.default.appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      agoraEngine.enableVideo();
    } catch (e) {
      console.log(e);
    }
  };

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  const join = async () => {
    console.log(config.default);
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(
        config.default.token,
        config.default.channelId,
        config.default.uid,
        {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        },
      );
      const getStreamId = agoraEngineRef.current?.createDataStream({
        syncWithAudio,
        ordered,
      });
      setStreamId(getStreamId);
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('You left the channel');
    } catch (e) {
      console.log(e);
    }
  };

  const sendMessage = () => {
    const buffer = Buffer.from(data);
    agoraEngineRef.current?.sendStreamMessage(1, buffer, buffer.length);
  };

  const onStreamMessage = (
    connection: RtcConnection,
    remoteUid: number,
    streamId: number,
    data: Uint8Array,
    length: number,
    sentTs: number,
  ) => {
    console.info(
      'onStreamMessage',
      'connection',
      connection,
      'remoteUid',
      remoteUid,
      'streamId',
      streamId,
      'data',
      data,
      'length',
      length,
      'sentTs',
      sentTs,
    );
    console.log(
      `Receive from uid:${remoteUid}`,
      `StreamId ${streamId}: ${data.toString()}`,
    );
  };

  const onStreamMessageError = (
    connection: RtcConnection,
    remoteUid: number,
    streamId: number,
    code: number,
    missed: number,
    cached: number,
  ) => {
    console.error(
      'onStreamMessageError',
      'connection',
      connection,
      'remoteUid',
      remoteUid,
      'streamId',
      streamId,
      'code',
      code,
      'missed',
      missed,
      'cached',
      cached,
    );
  };

  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.head}>Agora Video Calling Quickstart</Text>
      <View style={styles.btnContainer}>
        <Text onPress={join} style={styles.button}>
          Join
        </Text>
        <Text onPress={leave} style={styles.button}>
          Leave
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}>
        {isJoined ? (
          <React.Fragment key={0}>
            <RtcSurfaceView
              canvas={{uid: config.default.uid}}
              style={styles.videoView}
            />
            <Text>Local user uid: {config.default.uid}</Text>
          </React.Fragment>
        ) : (
          <Text>Join a channel</Text>
        )}
        {isJoined && remoteUid !== config.default.uid ? (
          <React.Fragment key={remoteUid}>
            <RtcSurfaceView
              canvas={{uid: remoteUid}}
              style={styles.videoView}
            />
            <Text>Remote user uid: {remoteUid}</Text>
          </React.Fragment>
        ) : (
          <Text>Waiting for a remote user to join</Text>
        )}
        <Text style={styles.info}>{message}</Text>
      </ScrollView>

      <TextInput placeholder="enter text" value={data} onChangeText={setData} />
      <Button title="send" onPress={() => sendMessage()} />
    </SafeAreaView>
  );
};

export default VideoCalls;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: {flex: 1, alignItems: 'center'},
  scroll: {flex: 1, backgroundColor: '#ddeeff', width: '100%'},
  scrollContainer: {alignItems: 'center'},
  videoView: {width: '90%', height: 200},
  btnContainer: {flexDirection: 'row', justifyContent: 'center'},
  head: {fontSize: 20},
  info: {backgroundColor: '#ffffe0', color: '#0000ff'},
});
