import Option from './Option';

export interface ContextMenu {
    show (): void;
    close (): void;
	addOption (option: Option): void;
}