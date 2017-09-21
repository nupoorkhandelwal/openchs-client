import {expect} from "chai";
import {ProgramEncounter, ProgramEnrolment, Observation, Concept, PrimitiveValue, MultipleCodedValues} from "openchs-models";
import EntityFactory from "openchs-models/test/EntityFactory";
import RuleCondition from "../../health_modules/rules/RuleCondition";

describe('RuleConditions', () => {
    var programEncounter, form, a1, a2, codedConceptA1;

    beforeEach(()=> {
        programEncounter = ProgramEncounter.createEmptyInstance();
        programEncounter.programEnrolment = ProgramEnrolment.createEmptyInstance();
        programEncounter.encounterDateTime = new Date();
        programEncounter.programEnrolment.enrolmentDateTime = new Date(2017, 0, 0, 5);
        programEncounter.programEnrolment.encounters.push(programEncounter);
        let conceptA1 = EntityFactory.createConcept('a1', Concept.dataType.Numeric);
        let conceptA2 = EntityFactory.createConcept('a2', Concept.dataType.Numeric);
        let conceptB1 = EntityFactory.createConcept('b1', Concept.dataType.Numeric);
        codedConceptA1 = EntityFactory.createConcept("coded question a1", Concept.dataType.Coded, );
        EntityFactory.addCodedAnswers(codedConceptA1, ["coded answer 1", "coded answer 2"]);

        programEncounter.observations.push(Observation.create(conceptA1, JSON.stringify(new PrimitiveValue('10', Concept.dataType.Numeric))));

        let anotherProgramEncounter = ProgramEncounter.createEmptyInstance();
        anotherProgramEncounter.observations.push(Observation.create(conceptB1, JSON.stringify(new PrimitiveValue('10', Concept.dataType.Numeric))));
        programEncounter.programEnrolment.encounters.push(anotherProgramEncounter);

        form = EntityFactory.createForm('foo');
        const formElementGroup1 = EntityFactory.createFormElementGroup('bar', 1, form);
        formElementGroup1.addFormElement(EntityFactory.createFormElement('a1', false, conceptA1, 1));
        formElementGroup1.addFormElement(EntityFactory.createFormElement('a2', false, conceptA2, 2));

        const formElementGroup2 = EntityFactory.createFormElementGroup('bar1', 1, form);
        formElementGroup2.addFormElement(EntityFactory.createFormElement('b1', false, conceptB1, 1));
        const formElement = EntityFactory.createFormElement('b2');
        formElementGroup2.addFormElement(formElement);


        a1 = new RuleCondition({
            conceptName: 'a1',
            programEncounter: programEncounter,
            form: form,
            programEnrolment: programEncounter.programEnrolment
        });

        a2 = new RuleCondition({
            conceptName: 'a2',
            programEncounter: programEncounter,
            form: form,
            programEnrolment: programEncounter.programEnrolment
        });
    });

    it('match to true by default', () => {
        expect(a1.matches()).to.be.true;
        expect(a2.matches()).to.be.true;

    });

    it('filledAtleastOnceInEntireEnrolment checks if value is filledAtleastOnceInEntireEnrolment in entire enrolment', () => {
        expect(a1.when.filledAtleastOnceInEntireEnrolment.matches()).to.be.true;
        expect(a2.when.filledAtleastOnceInEntireEnrolment.matches()).to.be.false;
    });


    it("valueInEntireEnrolment checks for the same or a different concept's value to be equal to something", () => {
        expect(a1.when.valueInEntireEnrolment('a1').equals(10).matches()).to.be.true;
        expect(a1.when.valueInEntireEnrolment('a1').equals(null).matches()).to.be.false;
        expect(a1.when.valueInEntireEnrolment('a2').equals(10).matches()).to.be.false;
    });

    it("truthy checks currently inspected value to be truthy", () => {
        expect(a1.when.valueInEntireEnrolment('a1').is.truthy.matches()).to.be.true;
        expect(a1.when.valueInEntireEnrolment('a2').is.truthy.matches()).to.be.false;
        expect(a1.when.valueInEntireEnrolment('c1').is.truthy.matches()).to.be.false;
    });

    it("matchesFn checks currently inspected value to be truthy", () => {
        expect(a1.when.valueInEntireEnrolment('a1').matchesFn(() => true).matches()).to.be.true;
        expect(a1.when.valueInEntireEnrolment('a1').matchesFn(() => false).matches()).to.be.false;
        expect(a1.when.valueInEntireEnrolment('c1').matchesFn((value) => {return value;}).matches()).to.be.false;
    });

    it("valueInEncounter checks for the same or a different concept's value to be equal to something", () => {
        expect(a1.when.valueInEncounter('a1').is.truthy.matches()).to.be.true;
        expect(a1.when.valueInEncounter('b1').is.truthy.matches()).to.be.false;
    });

    it('whenItem checks for a constant value. to match', () => {
        expect(a2.whenItem(programEncounter.programEnrolment.findObservationInEntireEnrolment('a1').getValue()).equals(10).matches()).to.be.true;
    });

    it("containsAnswerConceptName checks if the specified concept name exists in the result", () => {
        let codedObservation = Observation.create(codedConceptA1, new MultipleCodedValues());
        codedObservation.toggleMultiSelectAnswer(codedConceptA1.getPossibleAnswerConcept("coded answer 1").concept.uuid);
        programEncounter.observations.push(codedObservation);


        let ruleCondition = new RuleCondition({
            conceptName: codedConceptA1.name,
            programEncounter: programEncounter,
            form: form,
            programEnrolment: programEncounter.programEnrolment
        });

        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnswerConceptName("coded answer 1").matches()).to.be.true;
        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnswerConceptName("coded answer 2").matches()).to.be.false;
        expect(ruleCondition.when.valueInEncounter("non-existent question").containsAnswerConceptName("coded answer 2").matches()).to.be.false;
        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnswerConceptName("non-existent answer").matches()).to.be.false;
        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnswerConceptName(undefined).matches()).to.be.false;
        expect(ruleCondition.when.valueInEncounter(undefined).containsAnswerConceptName(undefined).matches()).to.be.false;

        codedObservation.toggleMultiSelectAnswer(codedConceptA1.getPossibleAnswerConcept("coded answer 2").concept.uuid);
        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnswerConceptName("coded answer 1").matches()).to.be.true;
        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnswerConceptName("coded answer 2").matches()).to.be.true;
    });

    it("containsAnyAnswerConceptName checks if any of the specified concept names exists in the result", () => {
        let codedObservation = Observation.create(codedConceptA1, new MultipleCodedValues());
        codedObservation.toggleMultiSelectAnswer(codedConceptA1.getPossibleAnswerConcept("coded answer 1").concept.uuid);
        programEncounter.observations.push(codedObservation);


        let ruleCondition = new RuleCondition({
            conceptName: codedConceptA1.name,
            programEncounter: programEncounter,
            form: form,
            programEnrolment: programEncounter.programEnrolment
        });

        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnyAnswerConceptName("coded answer 1").matches()).to.be.true;
        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnyAnswerConceptName("coded answer 2").matches()).to.be.false;
        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnyAnswerConceptName("coded answer 1", "coded answer 2").matches()).to.be.true;
        expect(ruleCondition.when.valueInEncounter(codedConceptA1.name).containsAnyAnswerConceptName("coded answer 1", "coded answer 2", "non-existent answer").matches()).to.be.true;

    });

    it('lessThan and greaterThan can be used to do inequality checks', () => {
        expect(a1.when.valueInEntireEnrolment('a1').is.lessThan(20).matches()).to.be.true;
        expect(a1.when.valueInEntireEnrolment('a1').is.lessThan(5).matches()).to.be.false;
        expect(a1.when.valueInEntireEnrolment('a1').is.lessThan(10).matches()).to.be.false;

        expect(a1.when.valueInEntireEnrolment('a1').is.greaterThan(5).matches()).to.be.true;
        expect(a1.when.valueInEntireEnrolment('a1').is.greaterThan(20).matches()).to.be.false;
        expect(a1.when.valueInEntireEnrolment('a1').is.greaterThan(5).matches()).to.be.true;
        expect(a1.when.valueInEntireEnrolment('a1').is.greaterThan(10).matches()).to.be.false;
    });

    it('not negates any condition', () => {
        expect(a1.when.valueInEntireEnrolment('a1').is.not.lessThan(5).matches()).to.be.true;
    });

    it('and can be used to do multiple checks', () => {
        expect(a1.when.valueInEntireEnrolment('a1').is.lessThan(15).and.valueInEntireEnrolment('a1').is.greaterThan(5).matches()).to.be.true;
        expect(a1.when.valueInEntireEnrolment('a1').is.lessThan(15).and.greaterThan(5).matches()).to.be.true;
    });

    it('or can be used to do multiple checks as well', () => {
        expect(a1.when.valueInEntireEnrolment('a1').is.lessThan(5).or.valueInEntireEnrolment('a1').is.greaterThan(5).matches()).to.be.true;
    });

    it("and and or are evaluated right to left", () => {
        expect(a1.when.whenItem(1).is.lessThan(5).and.greaterThan(5).or.lessThan(5).matches()).to.be.true;
        expect(a1.when.whenItem(1).is.greaterThan(5).and.lessThan(5).or.greaterThan(5).matches()).to.be.false;
    });
});