import {Container} from 'huject';

import {Draggable as DraggableInterface} from './interfaces/Draggable';
import Draggable from './impl/Draggable';

import Upload from './impl/Upload';
import UploadInterface from './interfaces/Upload';

const container = new Container();
container.register(UploadInterface, Upload);
container.register(DraggableInterface, Draggable);

export {container};
