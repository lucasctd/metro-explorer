import {Draggable as DraggableInterface} from '../interfaces/Draggable';
declare function require(name:string);
const DraggabillyLib = require('draggabilly');

class Draggabilly extends DraggableInterface {

	private draggabilly;

    grid: any = [110, 140];

	constructor() {
		super();
	}

	start() : void {
		const that = this;
		this.draggabilly = new DraggabillyLib (this.el, {
			grid: this.grid,
            containment: this.limit
		});
        this.draggabilly.on( 'dragStart', ( event, pointer ) => {
            that.onDrag(event, pointer)
        });
        this.draggabilly.on( 'dragMove', ( event, pointer ) => {
            that.onDragging(event, pointer)
        });
        this.draggabilly.on( 'dragEnd', ( event, pointer ) => {
            that.onDrop(event, pointer)
        });
	}
	
	/* Events */
	onDrag(event, args) {

	}
	
	onDragging(event, args) {
	
	}
	
	onDrop(event, args) {
        console.log("onDrag");
        console.log(event);
        console.log(args);
	}
	
	/* Methods */
	getCoord() : any {
        return this.draggabilly.position;
	}
	
	setCoord(x: number, y: number) {
	    this.el.style.left = x + "px";
        //this.el.style.top = y + "px";
	}
	
	destroy() {
        this.draggabilly.destroy();
	}
	
}

export {Draggabilly};
export default Draggabilly;