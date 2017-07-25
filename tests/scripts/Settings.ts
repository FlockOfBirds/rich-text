// tslint:disable:rule no-console no-angle-bracket-type-assertion
import * as fs from "fs";
import * as path from "path";
import { EnvironmentMode } from "./DeploymentService";

interface Settings {
    apiUrl: string;
    appName: string;
    branchName: string;
    environment: EnvironmentMode;
    key: string;
    password: string;
    projectId: string;
    teamServerUrl: string;
    user: string;
}

export const getSettings = (): Settings => {
    const localSettingFile = path.resolve(__dirname, "localSettings.ts");
    console.log("localSettingFile", localSettingFile);
    if (fs.existsSync(localSettingFile)) {
        console.log("Running with local settings");
        return require("./localSettings").settings; // TODO validate content of file
    } else if (process.env.CI) {
        return {
            apiUrl: process.env.MX_API_URL, // https://deploy.mendix.com/api/1
            appName: process.env.MX_APP_NAME, // fobapp
            branchName: process.env.MX_BRANCH_NAME, // trunk
            environment: <EnvironmentMode>process.env.MX_ENVIRONMENT, // Acceptance
// Secure Mendix account key with travis cli > travis encrypt MX_API_KEY=yourSecretKey --add env.global
            key: process.env.MX_API_KEY, // xxxxxxxx-xxxx-xxxx-xxxxx-xxxxxxxxxxxx
// Secure Mendix account password with travis cli > travis encrypt MX_PASSWORD=yourSecretPassword --add env.global
            password: process.env.MX_PASSWORD,
            projectId: process.env.MX_PROJECT_ID, // App ID like d424a4fd-9473-4b53-94a5-99ad227c2278
            teamServerUrl: process.env.MX_TEAM_SERVER_URL, // https://teamserver.sprintr.com;
            user: process.env.MX_USER // Mendix account login: user@example.com;
        };
    } else {
        throw Error("No config found");
    }
};
