import BaseService from './BaseService.js'
import Service from '../framework/bean/Service';
import _ from "lodash";
import {config, observationRules} from "openchs-health-modules";

@Service("programConfigService")
class ProgramConfigService extends BaseService {
    constructor(db, beanStore) {
        super(db, beanStore);
    }

    init() { }

    configForProgram(program) {
        return program && program.name && config(program.name);
    }

    observationRulesForProgram(program) {
        return program && program.name && observationRules(program.name);
    }

    findDashboardButtons(program) {
        return _.get(this.configForProgram(program), ['programDashboardButtons']);
    }
}

export default ProgramConfigService;