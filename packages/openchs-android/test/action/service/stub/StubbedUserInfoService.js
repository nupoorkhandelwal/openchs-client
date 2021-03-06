import StubbedBaseService from "./StubbedBaseService";
import {UserInfo} from "openchs-models";

class StubbedUserInfoService extends StubbedBaseService {
    constructor(serviceData) {
        super(serviceData);
    }

    getUserInfo() {
        return UserInfo.createEmptyInstance();
    }

    getUserSettings() {
        return this.getUserInfo().getSettings();
    }
}

export default StubbedUserInfoService;