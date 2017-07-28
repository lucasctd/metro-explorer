import {Draggable as DraggableInterface} from '../interfaces/Draggable';
declare function require(name:string);
var DraggableLib = require('draggable');

class Draggable implements DraggableInterface {

	private draggable;
	
    el: string;
    grid: number;
	limit: any;
    moveCursor: boolean = true;

    constructor() {
        console.log("build Draggable");
    }
	
	start() : void {
		const that = this;
		const opt = {
			grid: this.grid,
			limit: this.limit,
			setCursor: this.moveCursor,
			onDrag: (e, x, y) => {
				that.onDrag(e, [x, y]);
			}
		};
		this.draggable = new DraggableLib (this.el, opt);
		console.log(this.draggable);
	}
	
	/* Events */
	onDrag(event, args) {
		console.log(event);
		console.log(args);
	}
	
	onDragging(event, args) {
	
	}
	
	onDrop(event, args) {
	
	}
	
	/* Methods */
	getCoord() : any {
		return this.draggable.get();
	}
	
	setCoord(x: number, y: number) {
		this.draggable.set(x, y);
	}
	
	destroy() {
	
	}
	
}

export {Draggable};
export default Draggable;