import React from "react";
import AbstractComponent from "../framework/view/AbstractComponent";
import Path from "../framework/routing/Path";
import {Image, Text, View, Dimensions, TextInput, TouchableNativeFeedback} from "react-native";
import Styles from "./primitives/Styles";
import {CheckBox, Spinner} from "native-base";
import CHSContainer from "./common/CHSContainer";
import CHSContent from "./common/CHSContent";
import themes from "./primitives/themes";
import Distances from "./primitives/Distances";
import AuthService from "../service/AuthService";
import CHSNavigator from "../utility/CHSNavigator";
import Colors from "./primitives/Colors";

@Path('/setPasswordView')
class SetPasswordView extends AbstractComponent {
    static propTypes = {
        user: React.PropTypes.object
    };

    constructor(props, context) {
        super(props, context);
    }

    componentWillMount() {
        this.setState(() => {
            return {showPassword: false, showSpinner: false}
        });
    }

    errorMessage() {
        const error = this.state.errorMessage || '';
        return error.slice(error.indexOf(":") + 1).trim();
    }

    setNewPassword() {
        this.setState(() => {
            return {showSpinner: true};
        });
        this.context.getService(AuthService).completeNewPasswordChallenge(this.props.user, this.state.password).then(
            () => {
                this.setState(() => {
                    return {showSpinner: false}
                });
                CHSNavigator.navigateToLandingView(this, true, {tabIndex: 1, menuProps: {startSync: true}})
            },
            (error) => {
                this.setState(() => {
                    return {errorMessage: error.message, showSpinner: false}
                });
            }
        );
    }

    spinner() {
        return this.state.showSpinner ? (
            <View style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                backgroundColor: Colors.defaultBackground
            }}>
                <Spinner/>
            </View>
        ) : <View/>
    }

    render() {
        return (
            <CHSContainer theme={themes}>
                <CHSContent>
                    <View style={{
                        padding: 72,
                        paddingTop: 144,
                        flexDirection: 'column',
                        justifyContent: 'flex-start'
                    }}>

                        <Text
                            style={Styles.formLabel}>{`Enter new password for ${this.props.user.getUsername()}`}</Text>
                        <Text style={{
                            color: Colors.ValidationError,
                            justifyContent: 'center'
                        }}>{this.errorMessage()}</Text>

                        <TextInput placeholder={"password"} value={this.state.password}
                                   onChangeText={(password) => this.setState({password})}
                                   secureTextEntry={!this.state.showPassword}/>

                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <CheckBox checked={this.state.showPassword} onPress={() => this.setState((oldState) => {
                                return {showPassword: !oldState.showPassword}
                            })}/>
                            <Text style={[Styles.formLabel, {paddingLeft: 8}]}>{"Show password"}</Text>
                        </View>

                        <TouchableNativeFeedback onPress={() => {
                            this.setNewPassword()
                        }}
                                                 background={TouchableNativeFeedback.SelectableBackground()}>
                            <View style={[Styles.basicPrimaryButtonView, {width: 144, marginTop: 16}]}>
                                <Text style={{color: Styles.whiteColor, fontSize: 16}}>Change Password</Text>
                            </View>
                        </TouchableNativeFeedback>

                        {this.spinner()}
                    </View>
                </CHSContent>
            </CHSContainer>
        )

    }
}

export default SetPasswordView;