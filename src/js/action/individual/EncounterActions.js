import IndividualEncounterService from "../../service/IndividualEncounterService";
import EntityService from "../../service/EntityService";
import Form from "../../models/application/Form";
import _ from "lodash";
import RuleEvaluationService from "../../service/RuleEvaluationService";
import EncounterActionState from "../../state/EncounterActionState";

export class EncounterActions {
    static getInitialState() {
        return new EncounterActionState();
    }

    static onNewEncounter(state, action, context) {
        const newState = EncounterActions.getInitialState();
        newState.encounter = context.get(IndividualEncounterService).newEncounter(action.individualUUID);
        const form = context.get(EntityService).findByKey('formType', Form.formTypes.Encounter, Form.schema.name);
        newState.formElementGroup = form.formElementGroups[0];
        return newState;
    }

    static onPrimitiveObs(state, action, context) {
        const newState = state.clone();
        const validationResult = action.formElement.validate(action.value);
        newState.handleValidationResult(validationResult);
        newState.encounter.addOrUpdatePrimitiveObs(action.formElement.concept, action.value);
        return newState;
    }

    static toggleMultiSelectAnswer(state, action) {
        const newState = state.clone();
        const observation = newState.encounter.toggleMultiSelectAnswer(action.formElement.concept, action.answerUUID);
        const validationResult = action.formElement.validate(_.isNil(observation) ? null : observation.getValue());
        newState.handleValidationResult(validationResult);
        return newState;
    }

    static toggleSingleSelectAnswer(state, action) {
        const newState = state.clone();
        const observation = newState.encounter.toggleSingleSelectAnswer(action.concept, action.answerUUID);
        const validationResult = action.formElement.validate(_.isNil(observation) ? null : observation.getValue());
        newState.handleValidationResult(validationResult);
        return newState;
    }

    static onPrevious(state, action, context) {
        const newState = state.clone();
        const formElementGroup = newState.formElementGroup.previous();
        const encounter = newState.encounter;

        newState.formElementGroup = state.formElementGroup.previous();
        action.cb(newState.formElementGroup.isFirst);
        return newState;
    }

    static onNext(state, action, context) {
        const newState = state.clone();

        const encounter = newState.encounter;

        const validationResults = newState.formElementGroup.validateMandatoryFields(encounter);
        newState.handleValidationResults(validationResults);
        if (newState.validationResults.length !== 0) {
            return newState;
        }

        var encounterDecisions;
        const formElementGroup = newState.formElementGroup.next();
        if (_.isNil(formElementGroup)) {
            const decisionSupportValidationResult = context.get(RuleEvaluationService).validateEncounter(encounter);
            if (decisionSupportValidationResult.passed) {
                encounterDecisions = context.get(RuleEvaluationService).getEncounterDecision(encounter);
                context.get(IndividualEncounterService).addDecisions(encounter, encounterDecisions);
            } else {
                action.validationErrorCB(decisionSupportValidationResult.message);
                return newState;
            }
        }
        action.cb(_.isNil(formElementGroup), encounter, formElementGroup, encounterDecisions);
        return newState;
    }

    static onEncounterViewLoad(state, action, context) {
        const newState = EncounterActions.getInitialState();
        newState.encounter = action.encounter.cloneForNewEncounter();
        newState.formElementGroup = action.formElementGroup;
        return newState;
    }

    static onEncounterDateTimeChange(state, action, context) {
        const newState = state.clone();
        newState.encounter.encounterDateTime = action.value;
        return newState;
    }
}

const individualEncounterLandingViewActions = {
    NEXT: '887877e7-b376-478d-8c75-c0bac210bcf8',
    TOGGLE_MULTISELECT_ANSWER: "a71ceb47-6a67-4caf-907d-2c93c985c64b",
    TOGGLE_SINGLESELECT_ANSWER: "e3a5f0ea-a5de-44d6-b07b-e5c9cf0d1d5f",
    TEXT_INPUT_CHANGE: '6d34e303-318c-4e53-83b0-42f673a0e369',
    NEW_ENCOUNTER: '034f29e9-6204-49b3-b9fe-fec38851b966',
    ENCOUNTER_DATE_TIME_CHANGE: '42101ad3-9e4f-46d0-913d-51f3d9c4cc66',
    DATE_INPUT_CHANGE: '98eb574a-b721-4093-9296-a323537cd1e9'
};

const individualEncounterLandingViewActionsMap = new Map([
    [individualEncounterLandingViewActions.NEXT, EncounterActions.onNext],
    [individualEncounterLandingViewActions.TOGGLE_MULTISELECT_ANSWER, EncounterActions.toggleMultiSelectAnswer],
    [individualEncounterLandingViewActions.TOGGLE_SINGLESELECT_ANSWER, EncounterActions.toggleSingleSelectAnswer],
    [individualEncounterLandingViewActions.TEXT_INPUT_CHANGE, EncounterActions.onPrimitiveObs],
    [individualEncounterLandingViewActions.DATE_INPUT_CHANGE, EncounterActions.onPrimitiveObs],
    [individualEncounterLandingViewActions.NEW_ENCOUNTER, EncounterActions.onNewEncounter],
    [individualEncounterLandingViewActions.ENCOUNTER_DATE_TIME_CHANGE, EncounterActions.onEncounterDateTimeChange]

]);

const individualEncounterViewActions = {
    PREVIOUS: '4ebe84f9-6230-42af-ba0d-88d78c05005a',
    NEXT: '14bd2402-c588-4f16-9c63-05a85751977e',
    TOGGLE_MULTISELECT_ANSWER: "c5407cf4-f37a-4568-9d56-ffba58a3bafe",
    TOGGLE_SINGLESELECT_ANSWER: "6840941d-1f74-43ff-bd20-161e580abdc8",
    TOGGLE_BOOLEAN_ANSWER: '2683f0bd-61d4-4e88-84c9-87e28daff0be',
    TEXT_INPUT_CHANGE: '781a72ec-1ca1-4a03-93f8-379b5a828d6c',
    DATE_INPUT_CHANGE: 'ba886777-6f50-4e0b-8806-54c6d6b2e853',
    ON_LOAD: '71d74559-0fc0-4b9a-b996-f5c14f1ef56c'
};

const individualEncounterViewActionsMap = new Map([
    [individualEncounterViewActions.PREVIOUS, EncounterActions.onPrevious],
    [individualEncounterViewActions.NEXT, EncounterActions.onNext],
    [individualEncounterViewActions.TOGGLE_MULTISELECT_ANSWER, EncounterActions.toggleMultiSelectAnswer],
    [individualEncounterViewActions.TOGGLE_SINGLESELECT_ANSWER, EncounterActions.toggleSingleSelectAnswer],
    [individualEncounterViewActions.TOGGLE_BOOLEAN_ANSWER, EncounterActions.onPrimitiveObs],
    [individualEncounterViewActions.TEXT_INPUT_CHANGE, EncounterActions.onPrimitiveObs],
    [individualEncounterViewActions.DATE_INPUT_CHANGE, EncounterActions.onPrimitiveObs],
    [individualEncounterViewActions.NEW_ENCOUNTER, EncounterActions.onNewEncounter],
    [individualEncounterViewActions.ON_LOAD, EncounterActions.onEncounterViewLoad]
]);

export {
    individualEncounterLandingViewActions as IndividualEncounterLandingViewActions,
    individualEncounterLandingViewActionsMap as IndividualEncounterLandingViewActionsMap,
    individualEncounterViewActions as IndividualEncounterViewActions,
    individualEncounterViewActionsMap as IndividualEncounterViewActionsMap
};