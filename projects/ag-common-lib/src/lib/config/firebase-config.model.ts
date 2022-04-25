import { FirebaseApp } from "@firebase/app";

export class FirebaseConfig {
    constructor(config: FirebaseApp){
        this.config = config;
    }
    config: FirebaseApp
}