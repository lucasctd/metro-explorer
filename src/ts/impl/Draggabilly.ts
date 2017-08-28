import {Draggable as DraggableInterface} from '../interfaces/Draggable';
declare function require(name:string);
const DraggabillyLib = require('draggabilly');
import store from '../state/AppState';

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
		const el = event.path.filter(p => p.id && p.id.startsWith('ex_'))[0];
		const field = this.getField(Number(this.el.style.left.replace('px', '')), this.el.clientWidth, Number(this.el.style.top.replace('px', '')), this.el.clientHeight);
		let file = store.getters.getFileById(Number(this.el.id.replace('ex_', '')));
		file.field = field;
		store.dispatch('updateFile', file);
	}
	
	/* Methods */
	getCoord() : any {
        return this.draggabilly.position;
	}
	
	setCoord(x: number, y: number) {
	    this.el.style.left = x + "px";
        this.el.style.top = y + "px";
	}
	
	destroy() {
        this.draggabilly.destroy();
	}

	getField(left: number, fileWidth: number, top: number, fileHeight: number) : number {
		const coll: number = Math.trunc(left / fileWidth);
		const row: number = Math.trunc(top / fileHeight);
		return row * store.state.numGridX + coll;
	}
	
}

export {Draggabilly};
export default Draggabilly;