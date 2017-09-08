import {File as FileInterface} from '../interfaces/File';

class File extends FileInterface {

    visible: boolean = true;

    public getExtension() : string {
        const str = this.name.split(".");
        return str[str.length - 1];
    }
}

export default File;
export {File};