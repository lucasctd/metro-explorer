export interface File {
	id: number;
	name: string;
	parent: File;
	icon?: string;
}