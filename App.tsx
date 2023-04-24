import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  PermissionsAndroid,
} from 'react-native';
import VideoCalls from './VideoCalls';
import axios from 'axios';
import * as config from './config';

function App(): JSX.Element {
  useEffect(() => {
    axios
      .post('http://10.0.2.2:9000/getToken', {
        headers: {
          Accept: 'application/json',
          'content-Type': 'application/json',
        },
      })
      .then(res => {
        // console.log(res);
        config.default.token = res?.data?.token;
        config.default.uid = res?.data?.uid;
      })
      .catch(err => {
        console.log(err);
      });
  }, []);
  return (
    <SafeAreaView style={{flex: 1}}>
      <VideoCalls />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
