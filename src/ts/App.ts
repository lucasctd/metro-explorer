import {Explorer} from './impl/Explorer';
import Option from './impl/Option';
import FileImpl from './impl/File';
import File from './interfaces/File';

let files = [
    new FileImpl(1, "Print", undefined, "file-word-o"),
    new FileImpl(2, "Fox", undefined, "file-word-o"),
    new FileImpl(6, "Folder", undefined, "folder-o", undefined, true),
    new FileImpl(7, "Folder B", undefined, "folder-o", undefined, true)
];

class App extends Explorer {

    public moveFile(files: Array<File>): void {
        console.log(files);
    }
}

const explorer = new App("explorer");
explorer.setFiles(files);
explorer.run();