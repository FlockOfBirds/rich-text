// tslint:disable:rule no-console no-var-requires
import { SvnService } from "./SvnService";
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
const svn = new SvnService(projectUrl, settings.user, settings.password, buildFolder);
const version: string = pkg.version;
const widgetName: string = pkg.widgetName;

updateProject().then(success => process.exit(0), error => process.exit(1));

async function updateProject() {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            console.log("Checking out to " + buildFolder);
            await svn.checkOutBranch(settings.branchName);
            console.log("Copy widget");
            await copyWidget(path.join(buildFolder, "widgets"));
            console.log("create release folder ", releaseFolder);
            mkdirSync(releaseFolder);
            await copyWidget(releaseFolder);
            console.log("Zip project .mpk");
            await zipFolder(buildFolder, path.resolve(releaseFolder, "TestProject.mpk"));
            console.log("Committing changes");
            const changedFile = path.join(buildFolder, "widgets", widgetName + ".mpk");
            await svn.commit(changedFile, "CI script commit");
            console.log("Done");
            resolve(true);
        } catch (error) {
            console.error("Error updating Mendix project", error);
            reject(error);
        }
    });
}

async function copyWidget(destination: string) {
    return new Promise<boolean>((resolve, reject) => {
        const filename = widgetName + ".mpk";
        const source = path.join(distFolder, version, filename);
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

const mkdirSync = (dirPath: string) => {
    try {
        fs.mkdirSync(dirPath);
    } catch (error) {
        if (error.code !== "EEXIST") throw error;
    }
};

async function zipFolder(source, destination) {
    return new Promise<boolean>((resolve, reject) => {
        const output = fs.createWriteStream(destination);
        const archive = archiver("zip");

        output.on("close", () => {
            console.log(archive.pointer() + " total bytes");
            console.log("archiver has been finalized and the output file descriptor has closed.");
            resolve(true);
        });

        archive.on("error", error => {
            reject(error);
        });

        archive.pipe(output);
        archive.directory(source, "/");
        archive.finalize();
    });
}
