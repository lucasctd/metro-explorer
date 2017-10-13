import {Explorer} from './impl/Explorer';
import Option from './impl/Option';
import FileImpl from './impl/File';
import File from './interfaces/File';

const folder = new FileImpl(6, "Folder", undefined, "folder-o", undefined, true);

let files = [
    new FileImpl(1, "Print", undefined, "file-word-o"),
    new FileImpl(2, "Fox", undefined, "file-word-o"),
    folder,
    new FileImpl(7, "Folder B", folder, "folder-o", undefined, true)
];

class App extends Explorer {

    public moveFile(files: Array<File>): void {
        console.log(files);
    }
}

const explorer = new App("explorer");
explorer.setFiles(files);
explorer.run();