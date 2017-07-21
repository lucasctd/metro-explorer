import File from '../impl/File';

export interface Explorer {
	
    addFile (file: File): void;
    move (file: File): void;
	rename (file: File): void;
	show (file: File): void;
}