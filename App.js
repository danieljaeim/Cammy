import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Landing from './Landing';
import CameraFrame from './CameraFrame';
import axios from 'react-native-axios';
import API_KEY from './apikey';
import * as WebBrowser from 'expo-web-browser';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      image: null,
      imageURL: null,
      lastImageURL: null
    }
  }

  render() {

    const { image, imageURL, lastImageURL } = this.state;
    const { _callGoogleApi, _takeImage, _updateState, _validateURL, _takePhoto } = this;

    return (
      <View style={styles.container}>
        <CameraFrame
          _callGoogleApi={_callGoogleApi}
          _updateState={_updateState}
          _validateURL={_validateURL}
          _takePhoto={_takePhoto}
        />
        <Landing
          image={image}
          imageURL={imageURL}
          lastImageURL={lastImageURL}
          _takeImage={_takeImage}
          _validateURL={_validateURL}
        />
      </View>
    );
  }



  _callGoogleApi = async () => {
    try {
      let response = await axios({
        method: 'POST',
        url: `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
        data: {
          "requests": [
            {
              "image": {
                "content": this.state.imageURL
              },
              "features": [
                {
                  "type": "DOCUMENT_TEXT_DETECTION"
                }
              ]
            }
          ]
        },
        headers: {
          "Content-type": 'application/json',
        }
      });

      return response.data.responses[0].fullTextAnnotation.text;
    } catch (error) {
      console.error("ERRORFOUND", error);
    }
  }

  _takeImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true
    });

    if (!result.cancelled) {
      this.setState({
        image: result.uri,
        imageURL: result.base64
      });
    } else {
      return;
    }

    let returnValue = await this._callGoogleApi();
    returnValue = this._validateURL(returnValue);

    if (this.state.validURL == null) {
      alert(`Make sure to send a valid URL`);
      return;
    }

    if (this.state.validURL == false) {
      alert(`This URL ${returnValue} is invalid`);
      this.setState({ validURL: null })
      return;
    }
    await this._handleURLRedirect(returnValue);
  };

  _takePhoto = async (camera) => {

    const { _callGoogleApi, _validateURL, _handleURLRedirect, _updateState } = this;

    if (camera) {
        let photoURL = await camera.takePictureAsync({
            base64: true,
            quality: 1
        });

        await _updateState(photoURL);

        let returnValue = await _callGoogleApi();
        returnValue = _validateURL(returnValue);

        if (this.state.validURL == null) {
            alert(`Make sure to send a valid URL`);
            return;
        }

        if (this.state.validURL == false) {
            alert(`This URL ${returnValue} is invalid`);
            this.setState({ validURL: null })
            return;
        }
        await _handleURLRedirect(returnValue);
    }
}

  /*
Validates URL from taken URLString. Regex credits go to
StackOverFlow https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url 
*/

  _validateURL = (urlString) => {
    urlString = urlString.replace(/(\r\n|\n|\r)/gm, "");

    if (urlString.substring(0, 7) !== 'http://') {
      urlString = 'http://' + urlString;
    }

    let regexExpression = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
    if (urlString.match(regexExpression)) {
      this.setState({ validURL: true })
      return urlString;
    } else {
      this.setState({ validURL: false })
      return urlString;
    }
  }

  _handleURLRedirect = async (returnValue) => {
    try {
      let redirect = await WebBrowser.openBrowserAsync(returnValue,
        {
          toolbarColor: '#E87461',
          collapseToolbar: true
        });
      console.log(redirect);
      this.setState({ validURL: null })

    } catch (err) {
      throw err;
    }
  }

  _updateState = async (photoURL) => {
    this.setState(st => ({
      lastImageURL: st.imageURL,
      imageURL: photoURL.base64
    }));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
