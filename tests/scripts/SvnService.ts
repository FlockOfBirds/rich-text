// tslint:disable
import * as svnUltimate from "node-svn-ultimate";

export class SvnService {
    constructor(private url: string, private username: string, private password: string, private destination) { }

    checkOutBranch() {
        return new Promise<boolean>((resolve, reject) => {
            svnUltimate.commands.checkout(this.url, this.destination, {
                username: this.username,
                password: this.password
            }, (error) => {
                if (!error) {
                    resolve();
                } else {
                    this.cleanup();
                    reject("failed to checkout" + error);
                }
            } );
        });
    }

    cleanup() {
        return new Promise((resolve, reject) => {
            svnUltimate.commands.cleanup(this.destination, {}, (error) => {
                if (!error) {
                    resolve();
                } else {
                    reject("failed to cleanup " + this.destination + error);
                }
            } );
        });
    }

    status() {
        return new Promise((resolve, reject) => {
            svnUltimate.commands.status(this.destination, {}, (error, data) => {
                console.log("status", data);
                // console.log("status", data.target.entry.$.path, data.target.entry["wc-status"].$.item);
                if (!error) {
                    resolve();
                } else {
                    reject("failed to status " + this.destination + error);
                }
            } );
        });
    }

    commit(message: string) {
        return new Promise((resolve, reject) => {
            svnUltimate.commands.commit(this.destination, {
                params: [ `-m "${message}"` ]
            }, (error) => {
                if (!error) {
                    resolve();
                } else {
                    reject("failed to commit " + this.destination + error);
                }
            } );
        });
    }
}
