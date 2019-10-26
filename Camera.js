import * as React from 'react';
import { Button, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import API_KEY from '../cammy/apikey';
import axios from 'react-native-axios';

export default class Camera extends React.Component {
    state = {
        image: null,
        imageURL: null,
        token: null
    };

    render() {
        let { image } = this.state;

        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Button
                    title="Please pick a photo from your camera roll, with a valid URL"
                    onPress={this._takeImage}
                />
                {image &&
                    <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
            </View>
        );
    }

    componentDidMount() {
        this.getPermissionAsync();
        // var mins = new Date().getMinutes();
        // if(mins == "00"){
        //     await fetch('https://oauth2.googleapis.com/token', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }, 
        //         body: JSON.stringify({
        //             code: 
        //         })

        //     })
        //  }

        // setInterval(tick, 1000);
    }

    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
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
        }

        let returnValue = await this._callGoogleApi();
        console.log(returnValue);
    };

    _callGoogleApi = async () => {
        try {
            let response = await axios({
                method: 'POST',
                url: 'https://vision.googleapis.com/v1/images:annotate',
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
                    "Authorization": `Bearer ` + 'ya29.c.KmOpB5f_bLqjCrYTdWPdW4GoMVYF3BHUxHuNYVxBEOvcLvU9YqU3NlhD5dGjUjuN3s01FGm2UW36MlRE2ASfAbYan7zTWDO-bhrFtHTJQwIMVsOL3w6aqQKMW5A7nu7G267ww1A'
                }
            });

            return response.data.responses[0].fullTextAnnotation.text;
        } catch (error) {
            console.error("ERRORFOUND", error);
        }
    }
}