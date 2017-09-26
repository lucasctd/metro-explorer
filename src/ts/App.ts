import {Explorer} from './impl/Explorer';
import UploadInterface from './interfaces/Upload';
import Option from './impl/Option';
import FileImpl from './impl/File';

let opt = new Option("Show", (e, file) => {
				console.log("Show");
			});
			opt.disabled = true;
		let options: Array<Option> = [
			opt,
			new Option("Edit", (e, file) => {
				console.log("Edit");
			}),
			new Option("Delete", (e, file) => {
				console.log("Delete");
			})
		];
		let files = [
			new FileImpl(1, "Print", undefined, "file-word-o"),
			new FileImpl(2, "Fox", undefined, "file-word-o"),
			new FileImpl(3, "Folder", undefined, "folder-o", [new Option('Open', null), new Option('Delete', null)], true),
			new FileImpl(4, "Folder", undefined, "folder-o", [new Option('Open', null), new Option('Delete', null)], true),
			new FileImpl(5, "Folder", undefined, "folder-o", [new Option('Open', null), new Option('Delete', null)], true),
			new FileImpl(6, "Folder", undefined, "folder-o", [new Option('Open', null), new Option('Delete', null)], true),
			new FileImpl(7, "Folder B", undefined, "folder-o", [new Option('Open', null), new Option('Delete', null)], true)
		];

const explorer = new Explorer("explorer");
explorer.setFiles(files);
explorer.run();