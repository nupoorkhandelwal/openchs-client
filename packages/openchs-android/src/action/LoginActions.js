import AuthService from "../service/AuthService";
import General from "../utility/General";
import ValidationResult from "openchs-models/src/application/ValidationResult";

class LoginActions {
    static getInitialState() {
        return {userId: '', password: '', showPassword: false, loggingIn: false, loginError: '', loginSuccess: false, validationResult: ValidationResult.successful()};
    }

    static changeValue(state, key, value) {
        let newValue = {};
        newValue[key] = value;
        return Object.assign({}, state, newValue);
    }

    static onUserIdChange(state, action) {
        const validationResult = /\s/.test(action.value) ? ValidationResult.failure('','Username is incorrect, please correct it') : ValidationResult.successful();
        return Object.assign({}, state, {userId: action.value}, {validationResult:validationResult});
    }

    static onPasswordChange(state, action) {
        return Object.assign({}, state, {password: action.value});
    }

    static onLoginStarted(state, action, context) {
        const authService = context.get(AuthService);
        authService.authenticate(state.userId, state.password)
            .then(
                (response) => {
                    if (response.status === "LOGIN_SUCCESS") {
                        action.success();
                        return;
                    }
                    if (response.status === "NEWPASSWORD_REQUIRED") {
                        action.newPasswordRequired(response.user);
                        return;
                    }
                    General.logError("Unreachable code");
                },
                (error) => {
                    General.logError("LoginActions", error);
                    const errorMsg = _.includes(error.message,"Network request failed") ? error.message.concat('. Network is slow or disconnected. Please check internet connection') : error.message;
                    action.failure(errorMsg);
                    return;
                },
            );
        return Object.assign({}, state, {loggingIn: true, loginError: '', loginSuccess: false});
    }

    static onStateChange(state, action, context) {
        return Object.assign({}, state, action.newState);
    }

    static onToggleShowPassword(state) {
        return Object.assign({}, state, {showPassword: !state.showPassword})
    }
}

const LoginActionsNames = {
    ON_USER_ID_CHANGE: 'ace85b4c-9d5b-4be9-b4df-998c1acc6919',
    ON_PASSWORD_CHANGE: '635c0815-91a6-4611-bd84-f1fa6ac441d2',
    ON_CANCEL: '75c1ab7a-c22d-47f0-80c1-cf71f990c47a',
    ON_LOGIN: 'ff805a17-8397-4a2a-ab13-e01117a8c113',
    ON_STATE_CHANGE: '3da34606-897a-43ac-b41f-0ef31abc7a01',
    ON_TOGGLE_SHOW_PASSWORD: "9afb6cdc-aa96-4377-b092-44b218c6d9af",
};

const LoginActionsMap = new Map([
    [LoginActionsNames.ON_USER_ID_CHANGE, LoginActions.onUserIdChange],
    [LoginActionsNames.ON_PASSWORD_CHANGE, LoginActions.onPasswordChange],
    [LoginActionsNames.ON_LOGIN, LoginActions.onLoginStarted],
    [LoginActionsNames.ON_STATE_CHANGE, LoginActions.onStateChange],
    [LoginActionsNames.ON_TOGGLE_SHOW_PASSWORD, LoginActions.onToggleShowPassword]
]);

export {LoginActionsNames, LoginActionsMap, LoginActions} ;
