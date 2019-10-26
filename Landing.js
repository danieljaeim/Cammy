import * as React from 'react';
import { Button, Image, View, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import axios from 'react-native-axios';
import API_KEY from './apikey';
import * as WebBrowser from 'expo-web-browser';

export default class Landing extends React.Component {
    state = {
        image: null,
        imageURL: null,
        lastImageURL: null,
        token: null,
        hasCameraRollPermission: null,
        validURL: null
    };

    render() {
        let { image, hasCameraRollPermission } = this.state;
        if (hasCameraRollPermission === null) {
            return <View />
        } else if (hasCameraRollPermission === false) {
            return <Text>Cammy has no access to the cameraRoll ;(</Text>
        } else {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                        title="Camera"
                        onPress={this._takeImage}
                    />
                    {image &&
                        <Image source={{ uri: image }} style={{ 
                            width: 75,
                            height: 75,
                            position: 'absolute',
                            left: 150,
                            }} />}
                </View>
            );
        }
    }

    async componentDidMount() {
        await this.getPermissionAsync();
    }

    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            this.setState({ hasCameraRollPermission: status === 'granted'});
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
            this.setState({ image: result.uri, imageURL: result.base64 });
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
}


