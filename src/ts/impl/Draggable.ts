import {Draggable as DraggableInterface} from '../interfaces/Draggable';
import DraggableLib from 'Draggable';

class Draggable implements DraggableInterface {

	private draggable : DraggableLib;
	
    el: string;
    grid: number;
	limit: any;
	moveCursor: boolean = true;

    constructor(el: string, grid: number, limit: any) {
		this.el = el;
		this.grid = grid;
		this.limit = limit;
    }
	
	start() : void {
		const that = this;
		const opt = {
			grid: this.grid,
			limit: this.limit,
			setCursor: this.moveCursor,
			onDrag => (e, x, y){
				that.onDrag(e, [x, y]);
			}
		}
		this.draggable = new Draggable (this.el, opt);
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
	
	set moveCursor(moveCursor: boolean) {
		this.moveCursor = moveCursor;
	}
}

export {Draggable};