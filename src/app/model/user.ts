import { Permission } from "./permission";

export class AdmUser {

    private _id!: string;
    private _userName!: string;
    private _name!: string;
    private _position!: string;
    private _permissions!: Array<string>;
    private _permissionsData!: Array<Permission>;


    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }

    public get userName(): string {
        return this._userName;
    }
    public set userName(value: string) {
        this._userName = value;
    }

    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    public get position(): string {
        return this._position;
    }
    public set position(value: string) {
        this._position = value;
    }

    public get permissions(): Array<string> {
        return this._permissions;
    }
    public set permissions(value: Array<string>) {
        this._permissions = value;
    }

    public get permissionsData(): Array<Permission> {
        return this._permissionsData;
    }
    public set permissionsData(value: Array<Permission>) {
        this._permissionsData = value;
    }

}