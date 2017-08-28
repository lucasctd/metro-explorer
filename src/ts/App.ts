import {Explorer} from './impl/Explorer';
import UploadInterface from './interfaces/Upload';
import Option from './interfaces';

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
		let data = [new FileImpl(1, "Print", undefined, "file-word-o", options), new FileImpl(2, "Fox", undefined, "file-word-o", options)];

const e = new Explorer("#explorer");
//console.log(impl.upload.print());