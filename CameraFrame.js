import * as React from 'react';
import { View, Button, Text, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';

export default class CameraFrame extends React.Component {
    state = {
        capturing: null,
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
        flashMode: Camera.Constants.FlashMode.off
    };

    //TOGGLE FUNCTIONS
    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    render() {
        const { hasCameraPermission, flashMode, type, capturing } = this.state;
        const { _takePhoto } = this.props;
        const { width: winWidth, height: winHeight } = Dimensions.get('window');
        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        } else {
            return (
                <View>
                    <Camera
                        type={type}
                        flashMode={flashMode}
                        ref={camera => this.camera = camera}
                        style={{
                            height: winHeight / 1.3,
                            width: winWidth,
                            position: 'relative',
                            top: 60
                        }}
                    />
                    <Button
                        title="Take Photo"
                        onPress={async () => _takePhoto(this.camera)}
                    />
                </View>
            );
        }
    }
}