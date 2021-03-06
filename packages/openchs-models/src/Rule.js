import ReferenceEntity from "./ReferenceEntity";
import Form from './application/Form';
import Program from './Program';
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";

class Rule extends ReferenceEntity {
    static schema = {
        name: "Rule",
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            form: { type: 'Form', optional: true },
            program: { type: 'Program', optional: true },
            type: 'string',
            name: 'string',
            fnName: 'string',
            executionOrder: 'double',
            voided: {type: 'bool', default: false},
            data: {type: 'string', optional: true}
        }
    };

    static types = {
        Decision: "Decision",
        VisitSchedule: "VisitSchedule",
        ViewFilter: "ViewFilter",
        Checklists: "Checklists",
        Validation: "Validation",
        EnrolmentSummary: "EnrolmentSummary",
    };

    static fromResource(resource, entityService) {
        const rule = General.assignFields(resource, new Rule(), ['uuid', 'name', 'type', 'fnName', 'executionOrder']);
        rule.data = JSON.stringify(resource['data']);
        if (resource._links.hasOwnProperty('programUUID')) {
            rule.program = entityService.findByUUID(ResourceUtil.getUUIDFor(resource, "programUUID"), Program.schema.name);
        }
        else
            rule.form = entityService.findByUUID(ResourceUtil.getUUIDFor(resource, "formUUID"), Form.schema.name);
        rule.voided = resource['voided'] || false;
        return rule;
    }

    clone() {
        return super.clone(new Rule());
    }

}

export default Rule;
