import React from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import Path from "../../framework/routing/Path";
import ProgramFormComponent from "./ProgramFormComponent";
import {Actions} from "../../action/program/ProgramEnrolmentActions";
import {ProgramEnrolment} from "openchs-models";
import ProgramEnrolmentState from "../../action/program/ProgramEnrolmentState";
import Reducers from "../../reducer";
import General from "../../utility/General";
import {ToastAndroid} from "react-native";

@Path('/ProgramEnrolmentView')
class ProgramEnrolmentView extends AbstractComponent {
    static propTypes = {
        enrolment: React.PropTypes.object.isRequired
    };

    static usageContext = {
        usage: ProgramEnrolmentState.UsageKeys.Enrol,
        dateAction: Actions.ENROLMENT_DATE_TIME_CHANGED,
        dateKey: 'enrolmentDate',
        dateField: 'enrolmentDateTime',
        dateValidationKey: ProgramEnrolment.validationKeys.ENROLMENT_DATE
    };

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.programEnrolment);
        this.state = {displayed:true};
    }

    viewName() {
        return "ProgramEnrolmentView";
    }

    componentWillMount() {
        this.dispatchAction(Actions.ON_LOAD, {enrolment: this.props.enrolment, usage: ProgramEnrolmentView.usageContext.usage});
        return super.componentWillMount();
    }

    onBack() {
        this.dispatchAction(Actions.ON_LOAD, {enrolment: this.props.enrolment, usage: ProgramEnrolmentView.usageContext.usage, forceLoad: true});
        this.goBack();
    }

    onHardwareBackPress() {
        this.previous();
        return true;
    }

    previous() {
        this.state.wizard.isFirstPage() ? this.onBack() : this.dispatchAction(Actions.PREVIOUS);
        
    }

    displayMessage(message) {
        if (message && this.state.displayed){
            ToastAndroid.show(message, ToastAndroid.SHORT);
            this.setState({displayed:false})
        }
    }
    render() {
        General.logDebug(this.viewName(), 'render');
        this.displayMessage(this.props.message);
        return <ProgramFormComponent editing={this.props.editing} state={this.state}
                                     context={ProgramEnrolmentView.usageContext} backFunction={() => this.onBack()}
                                     previous={() => this.previous()}/>;
    }
}

export default ProgramEnrolmentView;
