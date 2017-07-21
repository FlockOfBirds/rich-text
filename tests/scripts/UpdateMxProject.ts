// tslint:disable
import { SvnService } from "./SvnService";
import { getSettings } from "./Settings";
import * as fs from "fs";
import * as path from "path";

const pkg: any = require("../../package.json");
const settings = getSettings();

const distFolder = path.resolve(__dirname, "../../dist");
const buildFolder = path.resolve(distFolder, "mxbuild");
const projectUrl = settings.teamServerUrl + "/" + settings.projectId + "/" + settings.branchName;
const svn = new SvnService(projectUrl, settings.user, settings.password, buildFolder);
const version: string = pkg.version;
const widgetName: string = pkg.widgetName;

updateProject();

async function updateProject() {
    try {
        console.log("Checking out to " + buildFolder);
        await svn.checkOutBranch();
        console.log("Copy widget");
        await copyWidget();
        console.log("Committing changes");
        await svn.commit("CI script commit");
        console.log("Done");
    } catch (error) {
        console.error("Error updating Mendix project", error);
    }
}

async function copyWidget() {
    return new Promise<boolean>((resolve, reject) => {
        const filename = widgetName + ".mpk";
        const source = path.join(distFolder, version, filename);
        const destination = path.join(buildFolder, "widgets");
        fs.access(destination, async error => {
            if (error) {
                fs.mkdirSync(destination);
            }
            try {
                await copyFile(source, path.join(destination, filename));
                resolve(true);
            } catch (copyError) {
                reject(copyError);
            }
        });
    });
}

async function copyFile(source, destination) {
    return new Promise<boolean>((resolve, reject) => {
        const readStream = fs.createReadStream(source);
        readStream.once("error", error => {
            reject(error);
        });
        readStream.once("end", () => {
            console.log("done copying");
            resolve(true);
        });
        readStream.pipe(fs.createWriteStream(destination));
    });
}
