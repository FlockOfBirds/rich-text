// tslint:disable
import * as fs from "fs";
import * as path from "path";

interface Settings {
    branchName: string;
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
    } else if (process.env.CI){
        // TODO check travis running?
        return {
            branchName: process.env.BRANCH_NAME, // trunk
// Secure Mendix account password with travis cli > travis encrypt MENDIX_PASSWORD=yourSecretPassword --add env.global
            password: process.env.MENDIX_PASSWORD,
            projectId: process.env.PROJECT_ID, // App ID like d424a4fd-9473-4b53-94a5-99ad227c2278
            teamServerUrl: process.env.TEAM_SERVER_URL, // https://teamserver.sprintr.com;
            user: process.env.MX_USER // Mendix account login: user@example.com;
        };
    } else {
        throw Error("No config found");
    }
};
