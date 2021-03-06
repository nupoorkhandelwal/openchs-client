import {Text, TextInput, View} from "react-native";
import React from "react";
import AbstractFormElement from "./AbstractFormElement";
import DGS from "../../primitives/DynamicGlobalStyles";
import Colors from '../../primitives/Colors';
import Distances from "../../primitives/Distances";
import Styles from "../../primitives/Styles";

class DurationFormElement extends AbstractFormElement {
    static propTypes = {
        label: React.PropTypes.string.isRequired,
        actionName: React.PropTypes.string.isRequired,
        compositeDuration: React.PropTypes.object.isRequired,
        validationResult: React.PropTypes.object,
        element: React.PropTypes.object.isRequired,
    };

    constructor(props, context) {
        super(props, context);
    }

    onUpdate(duration) {
        return (value) =>
            this.dispatchAction(this.props.actionName, {
                formElement: this.props.element,
                compositeDuration: this.props.compositeDuration.changeValue(duration, value)
            });
    }

    renderDuration(duration, idx) {
        return (
            <View key={idx} style={{flexDirection: 'row', marginRight: 10}}>
                <TextInput style={[Styles.formBodyText, {
                    paddingBottom: 5,
                    paddingTop: 0,
                    marginBottom: 5,
                    width: 50,
                    color: Colors.InputNormal
                }]}
                           keyboardType='numeric'
                           underlineColorAndroid={this.borderColor}
                           value={duration.durationValue}
                           onChangeText={this.onUpdate(duration)}/>
                <Text style={DGS.formRadioText}>{this.I18n.t(duration.durationUnit)}</Text>
            </View>);
    }

    render() {
        let labelText = this.label;
        const compositeDuration = this.props.compositeDuration;
        const durationView = compositeDuration.durations.map((duration, idx) => this.renderDuration(duration, idx));
        return (
            <View>
                <View style={{backgroundColor: '#ffffff', borderStyle: 'dashed'}}>
                    <Text style={Styles.formLabel}>{labelText}</Text>
                </View>
                <View style={{
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: Colors.InputBorderNormal,
                    paddingHorizontal: Distances.ScaledContentDistanceFromEdge,
                    paddingTop: 10
                }}>
                    <View style={[{flexDirection: 'row'}]}>
                        <View style={{flexDirection: 'row'}}>
                            {durationView}
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

export default DurationFormElement;
