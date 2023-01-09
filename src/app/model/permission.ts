export class Permission {

    private _name!: string;  
    private _url!: string;  
    private _hasRedirectProtection!: boolean;  
    private _caption!: string;

    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    public get url(): string {
        return this._url;
    }
    public set url(value: string) {
        this._url = value;
    }

    public get hasRedirectProtection(): boolean {
        return this._hasRedirectProtection;
    }
    public set hasRedirectProtection(value: boolean) {
        this._hasRedirectProtection = value;
    }

    public get caption(): string {
        return this._caption;
    }
    public set caption(value: string) {
        this._caption = value;
    }
  
}