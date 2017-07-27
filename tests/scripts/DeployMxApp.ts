// tslint:disable:rule no-console no-var-requires max-line-length
import { DeploymentService, EnvironmentMode } from "./DeploymentService";
import { BuildService } from "./BuildService";
import { getSettings } from "./Settings";
import * as fs from "fs";
import * as archiver from "archiver";
import * as path from "path";

const pkg: any = require("../../package.json");
const settings = getSettings();

const distFolder = path.resolve(__dirname, "../../dist");
const buildFolder = path.resolve(distFolder, "mxbuild");
const releaseFolder = path.resolve(distFolder, "release");
const projectUrl = settings.teamServerUrl + "/" + settings.projectId;
const deploy = new DeploymentService(settings.apiUrl, settings.user, settings.key);
const build = new BuildService(settings.apiUrl, settings.user, settings.key);
const version: string = pkg.version;
const widgetName: string = pkg.widgetName;

const appName = settings.appName;
const environment: EnvironmentMode = settings.environment;
const branchName = settings.branchName;

deployApp().then(success => process.exit(0), error => process.exit(1));

async function deployApp() {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            console.log("Get branch details");
            const branch = await deploy.getBranch(appName, branchName);
            const latestBuiltRevision = branch.LatestTaggedVersion.substring(branch.LatestTaggedVersion.lastIndexOf(".") + 1);
            if (latestBuiltRevision === branch.LatestRevisionNumber.toString()) {
                console.log("It is not needed to build, as the latest revision is already built.");
                resolve(true);
                return;
            }
            const nextRev = branch.LatestRevisionNumber.toString();
            console.log("Start build:", appName, branchName, nextRev, version);
            const buildAction = await build.startBuild(appName, branchName, nextRev, version);
            console.log("Wait for build:", appName, buildAction.PackageId);
            const deployPackage = await build.waitForBuild(appName, buildAction.PackageId, 600);
            if (deployPackage.Status !== "Succeeded") {
                console.log("No build succeeded within 10 minutes.");
                reject("No build succeeded within 10 minutes.");
                return;
            }
            let started = false;
            if (environment === "Sandbox") {
                // Build in the Sandbox does automatically transport and and restarts after 60 seconds
                started = await deploy.waitForSandboxStart(appName, 600);
            } else {
                console.log("Stop app:", appName, environment);
                await deploy.stopApp(appName, environment);
                console.log("Clean environment:", appName, environment);
                await deploy.cleanApp(appName, environment);
                console.log("Transport package:", appName, environment, buildAction.PackageId);
                await deploy.transportPackage(appName, environment, buildAction.PackageId);
                console.log("Start app:", appName, environment);
                const startJob = await deploy.startApp(appName, environment);
                console.log("Wait for startup:", appName, environment, startJob.JobId);
                started = await deploy.waitForStart(appName, environment, startJob.JobId, 600);
            }

            if (started === true) {
                console.log("App successfully started.");
                resolve(true);
            } else {
                console.error("Failed to startup");
                reject("Failed to startup");
            }
            console.log("Done");
        } catch (error) {
            console.error("Error deploying", error);
            reject(error);
        }
    });
}
