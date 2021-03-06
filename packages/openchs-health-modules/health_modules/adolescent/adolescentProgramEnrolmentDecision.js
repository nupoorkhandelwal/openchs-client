import EnrolmentFormHandler from "./formFilters/ExitFormHandler";
import {FormElementsStatusHelper, VisitScheduleBuilder, RuleFactory} from "rules-config/rules";
import C from "../common";


const EnrolmentDecisions = RuleFactory("32b3555a-7fe9-4246-a470-21ab2d2954e2", "Decision");

const EnrolmentViewFilters = RuleFactory("32b3555a-7fe9-4246-a470-21ab2d2954e2", "ViewFilter");
const ExitFilters = RuleFactory('5f8dc84d-90ff-46ca-9a56-169bd778687f', 'ViewFilter');

@EnrolmentViewFilters("cfaf14ea-6c8c-4909-a808-bdef784747e2", "ALl Enrolment Filters", 1.0, {})
class EnrolmentFilter {
    static exec(enrolment, formElementGroup) {
        return getFormElementsStatuses(enrolment, formElementGroup);
    }
}

@ExitFilters('f0b042a5-4232-46cb-b5c3-b320fc0fce48', 'Adolescent exit form filters', 1, {})
class ExitFilter {
    static exec(enrolment, formElementGroup) {
        return getFormElementsStatuses(enrolment, formElementGroup);
    }
}

@EnrolmentDecisions("703ad40c-7e68-488c-9c85-e169e7fa1b21", "ALl Enrolment Decisions", 1.0, {})
class EnrolmentDecision {
    static exec(enrolment, decisions, context, today) {
        return getDecisions(enrolment, context, today);
    }
}

const getDecisions = (programEnrolment, context, today) => {
    return {enrolmentDecisions: [], encounterDecisions: []};
};

const getFormElementsStatuses = (programEnrolment, formElementGroup) => {
    let handler = new EnrolmentFormHandler();
    return FormElementsStatusHelper.getFormElementsStatuses(handler, programEnrolment, formElementGroup);
};

const newScheduledEncounter = (enrolment) => {
    const nextScheduledRoutineEncounter = _.chain(enrolment.scheduledEncounters())
        .filter((enc) => !enc.encounterDateTime)
        .filter((enc) => isRoutineEncounter(enc))
        .head()
        .value();

    return nextScheduledRoutineEncounter && nextScheduledRoutineEncounter.cloneForEdit() || {};
};

const getNextScheduledVisits = function (programEnrolment, config, today, currentEncounter) {
    const scheduleBuilder = new VisitScheduleBuilder({programEnrolment: programEnrolment});
    scheduleBuilder.add({
        name: "Annual Visit",
        encounterType: "Annual Visit",
        earliestDate: programEnrolment.enrolmentDateTime,
        maxDate: C.addDays(C.copyDate(programEnrolment.enrolmentDateTime), 10)
    }).whenItem(programEnrolment.getEncounters(true).length).equals(0);


    const existingUnfinishedDropoutHomeVisit = programEnrolment.getEncounters(true)
        .filter(encounter => encounter.encounterType.name === "Dropout Home Visit"
            && _.isNil(encounter.encounterDateTime));
    scheduleBuilder.add({
            name: "Dropout Home Visit",
            encounterType: "Dropout Home Visit",
            earliestDate: programEnrolment.enrolmentDateTime,
            maxDate: C.addDays(C.copyDate(programEnrolment.enrolmentDateTime), 15)
        }
    ).when.valueInEnrolment("School going").containsAnswerConceptName("Dropped Out")
        .and.whenItem(existingUnfinishedDropoutHomeVisit.length).equals(0);
    return scheduleBuilder.getAll();
};

const AdolscentEnrolmentVisitSchedule = RuleFactory("32b3555a-7fe9-4246-a470-21ab2d2954e2", "VisitSchedule");

@AdolscentEnrolmentVisitSchedule("9b1d79e4-fa15-406b-8410-1f46dc64613f", "Adolescent Enrolment Visit Schedule", 1.0, {})
class AdolVisitSchedule {
    static exec(enrolment, schedule, visitScheduleConfig) {
        return getNextScheduledVisits(enrolment, visitScheduleConfig);
    }
}

export {getDecisions, getNextScheduledVisits, getFormElementsStatuses};