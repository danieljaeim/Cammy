import * as React from 'react';
import { Button, Image, View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

export default class Landing extends React.Component {
    state = {
        hasCameraRollPermission: null,
        validURL: null
    };

    render() {
        let { image, _takeImage } = this.props;
        let { hasCameraRollPermission } = this.state;
        if (hasCameraRollPermission === null) {
            return <View />
        } else if (hasCameraRollPermission === false) {
            return <Text>Cammy has no access to the cameraRoll ;(</Text>
        } else {
            return (
                <View style={{ flex: 1, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    top: 20,
                    left: 120
                }}>
                    <Button
                        title="Camera-Roll"
                        onPress={_takeImage}
                    />
                    {image &&
                        <Image source={{ uri: image }} style={{ 
                            width: 60,
                            height: 60,
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
}


