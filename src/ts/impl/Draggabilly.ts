import {Draggable as DraggableInterface} from '../interfaces/Draggable';
declare function require(name:string);
var DraggabillyLib = require('draggabilly');

class Draggabilly implements DraggableInterface {

	private draggabilly;

    el: any;
    grid: number = 100;
	limit: any;

	constructor() {
		console.log("loading Draggabilly");
	}

	start() : void {
		const that = this;
		this.draggabilly = new DraggabillyLib (this.el, {
			grid: [ 110, 140 ]
		});
	}
	
	/* Events */
	onDrag(event, args) {
		console.log(args);
	}
	
	onDragging(event, args) {
	
	}
	
	onDrop(event, args) {
	
	}
	
	/* Methods */
	getCoord() : any {

	}
	
	setCoord(x: number, y: number) {

	}
	
	destroy() {
	
	}
	
}

export {Draggabilly};
export default Draggabilly;