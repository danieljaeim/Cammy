import * as React from 'react';
import { View, Text, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import LottieView from 'lottie-react-native';
import Svg, { Circle } from 'react-native-svg';
import Slider from "react-native-slider";


export default class CameraFrame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            capturing: null,
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            flashMode: Camera.Constants.FlashMode.off,
            zoom: 0
        };
    }

    //TOGGLE FUNCTIONS
    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    async componentDidUpdate(prevProps) {
        if (this.props.isLoading !== prevProps.isLoading) {
            this.setState({ isLoading: prevProps.isLoading })
        }
    }

    render() {
        const { hasCameraPermission, flashMode, type, zoom } = this.state;
        const { _takePhoto, isLoading } = this.props;
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
                        zoom={zoom}
                        style={{
                            height: winHeight / 1.3,
                            width: winWidth,
                            position: 'relative',
                            top: 60
                        }}
                    >
                        {isLoading ?
                            <LottieView
                                source={require("../cammy/Lottie.json")}
                                loop
                                autoPlay
                            /> : null}
                        <Slider
                            style={{ width: winWidth / 1.1, height: 40, top: 600, left: 20, zIndex: 1 }}
                            minimumValue={0}
                            maximumValue={1}
                            minimumTrackTintColor="#FFFFFF"
                            maximumTrackTintColor="#FFFFFF"
                            onValueChange={val => this.setState({ zoom: val })}
                        />
                    </Camera>
                    <TouchableOpacity
                        style={{
                            alignItems: 'center',
                            top: 10
                        }}>
                        <Svg
                            onPress={() => _takePhoto(this.camera)}
                            height={100}
                            width={100}
                            viewBox="0 0 100 100">
                            <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="black"
                                strokeWidth="2.5"
                                fill="white"
                            />
                        </Svg>
                    </TouchableOpacity>
                </View>
            );
        }
    }
}