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
        token: null,
        hasCameraPermission: null,
    };

    render() {
        let { image, hasCameraPermission } = this.state;
        if (hasCameraPermission === null) {
            return <View />
        } else if (hasCameraPermission === false) {
            return <Text>Cammy has no access to the camera ;(</Text>
        } else {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                        title="Camera"
                        onPress={this._takeImage}
                    />
                    {image &&
                        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                </View>
            );
        }
    }

    componentDidMount() {
        this.getPermissionAsync();
    }

    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA);
            this.setState({ hasCameraPermission: status === 'granted' });
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
        console.log(returnValue);
        returnValue = returnValue.trim().split(" ").join('');
        await this._handleURLRedirect(returnValue);
        
    };

    _handleURLRedirect = async (returnValue) => {
        let redirect = await WebBrowser.openBrowserAsync('http://' + returnValue);
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


