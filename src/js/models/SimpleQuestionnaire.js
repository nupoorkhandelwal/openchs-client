import SummaryField from "./SummaryField";

class SimpleQuestionnaire {
    constructor(questionnaireData, concepts) {
        this.questionnaireConfigurations = questionnaireData;
        this.concepts = concepts;
    }

    getQuestion(questionIndex) {
        var questionConfiguration = this.questionnaireConfigurations.questions[questionIndex];
        var conceptData = this.concepts.findByName(questionConfiguration.name);
        return {
            name: questionConfiguration.name,
            questionDataType: conceptData.datatype.name,
            isFirstQuestion: questionIndex === 0,
            isLastQuestion: questionIndex === this.questionnaireConfigurations.questions.length - 1,
            isMandatory: questionConfiguration.mandatory === undefined ? true : questionConfiguration.mandatory,
            isMultiSelect: questionConfiguration.multiSelect === undefined ? false : questionConfiguration.multiSelect,
            answers: conceptData.answers === undefined ? [] : conceptData.answers,
            lowAbsolute: conceptData.lowAbsolute,
            hiAbsolute: conceptData.hiAbsolute
        };
    }

    get questions() {
        return this.questionnaireConfigurations.questions;
    }

    get decisionKeys() {
        return this.questionnaireConfigurations.decisionKeys;
    }

    get summaryFields() {
        return this.questionnaireConfigurations.summaryFields.map((summaryField) => {
            if (this.questions.find(function (question) {
                    return summaryField === question.name;
                }) !== undefined)
                return new SummaryField(summaryField, SummaryField.Question);
            if (this.decisionKeys.indexOf(summaryField) !== -1)
                return new SummaryField(summaryField, SummaryField.DecisionKey);
        });
    }

    get name() {
        return this.questionnaireConfigurations.name;
    }
}

SimpleQuestionnaire.Numeric = 'Numeric';
SimpleQuestionnaire.Text = 'Text';

export default SimpleQuestionnaire;