import {Draggable as DraggableInterface} from '../interfaces/Draggable';
declare function require(name:string);
const DraggableLib = require('draggable');

class Draggable implements DraggableInterface {

	private draggable;
	
    el: any;
    grid: number = 110;
	limit: any;
	moveCursor: boolean = true;
	
	constructor() {
		console.log("loading Draggable");
	}

	start() : void {
		this.draggable = new DraggableLib (this.el, this.makeDraggableOptions());
	}

	private makeDraggableOptions() {
        const that = this;
	    return {
            grid: this.grid,
            limit: this.limit,
            setCursor: this.moveCursor,
            onDragStart: (e, x, y) => {
                that.onDrag(e, [x, y]);
            },
            onDrag: (e, x, y) => {
                that.onDragging(e, [x, y]);
            },
            onDragEnd: (e, x, y) => {
                that.onDrop(e, [x, y]);
            }
        };
    }
	
	/* Events */
	onDrag(element, args) {
		console.log("onDrag");
	}
	
	onDragging(element, args) {
        console.log("onDragging");
	}
	
	onDrop(element, args) {
        console.log("onDrop");
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