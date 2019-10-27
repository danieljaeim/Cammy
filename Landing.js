import * as React from 'react';
import { Button, View, Text, TouchableOpacity, Image } from 'react-native';
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
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    top: 20,
                    left: 120
                }}>
                    <Button
                        title="CameraRoll"
                        style={{ alignItems: 'center' }}
                        onPress={_takeImage}>
                    </Button>
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
            this.setState({ hasCameraRollPermission: status === 'granted' });
        }
    }
}


