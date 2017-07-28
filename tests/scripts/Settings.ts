// tslint:disable:rule no-console no-angle-bracket-type-assertion no-var-requires
import * as fs from "fs";
import * as path from "path";
import { EnvironmentMode } from "./DeploymentService";

const pkg: any = require("../../package.json");

export interface MinimalSettings {
    appName: string;
    key: string;
    user: string;
    password: string;
    projectId: string;
}
interface Settings extends MinimalSettings {
    apiUrl: string;
    branchName: string;
    environment: EnvironmentMode;
    projectUrl: string;
    teamServerUrl: string;
    testProjectName: string;
    widget: {
        name: string;
        version: string;
    };
    folder: {
        build: string;
        dist: string;
        release: string;
    };
}

export const defaultSettings: PartialSettings = {
    apiUrl: "https://deploy.mendix.com/api/1",
    branchName: "trunk",
    environment: "Sandbox",
    teamServerUrl: "https://teamserver.sprintr.com",
    testProjectName: "TestProject.mpk"
};

type Partial<T> = {
    [P in keyof T]?: T[P];
};

export type PartialSettings = Partial<Settings>;

export const getSettings = (): Settings => {
    const localSettingFile = path.resolve(__dirname, "localSettings.ts");
    console.log("localSettingFile", localSettingFile);
    let settings: PartialSettings = defaultSettings;
    if (fs.existsSync(localSettingFile)) {
        console.log("Running with local settings");
        const localFileSettings = require("./localSettings").settings;
        console.log("localFileSettings", localFileSettings);
        settings = { ...settings, ...localFileSettings };
        checkSettings(settings);
    } else if (process.env.CI) {
        checkEnvVars();
        settings = {
            apiUrl: process.env.MX_API_URL || defaultSettings.apiUrl,
            appName: process.env.MX_APP_NAME, // fobapp
            branchName: process.env.MX_BRANCH_NAME || defaultSettings.branchName,
            environment: <EnvironmentMode>process.env.MX_ENVIRONMENT || defaultSettings.environment,
// Secure Mendix account key with travis cli > travis encrypt MX_API_KEY=yourSecretKey --add env.global
            key: process.env.MX_API_KEY, // xxxxxxxx-xxxx-xxxx-xxxxx-xxxxxxxxxxxx
// Secure Mendix account password with travis cli > travis encrypt MX_PASSWORD=yourSecretPassword --add env.global
            password: process.env.MX_PASSWORD,
            projectId: process.env.MX_PROJECT_ID, // App ID like d424a4fd-9473-4b53-94a5-99ad227c2278
            teamServerUrl: process.env.MX_TEAM_SERVER_URL || defaultSettings.teamServerUrl,
            user: process.env.MX_USER // Mendix account login: user@example.com;
        };
    } else {
        throw Error("No config found");
    }
    const distFolder = path.resolve(__dirname, "../../dist");
    settings.folder = {
        build: path.resolve(distFolder, "mxbuild"),
        dist: distFolder,
        release: path.resolve(distFolder, "release")
    };
    settings.widget = {
        name: pkg.widgetName,
        version: pkg.version
    };
    settings.projectUrl = settings.teamServerUrl + "/" + settings.projectId;
    return <Settings>settings;
};

function checkEnvVars() {
    const vars = [ "MX_APP_NAME", "MX_API_KEY", "MX_PASSWORD", "MX_PROJECT_ID", "MX_USER" ];
    const missingVars = vars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw Error("Missing environment variable: " + missingVars.join(", "));
    }
}

function checkSettings(settings: PartialSettings) {
    const minimalSettings = [ "appName", "key", "password", "projectId", "user" ];
    const missingSettings = minimalSettings.filter(varName => !settings[varName]);
    if (missingSettings.length > 0) {
        throw Error("Missing setting: " + missingSettings.join(", "));
    }
}
