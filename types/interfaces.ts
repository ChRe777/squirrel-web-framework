/**
 * Data type
 */
export interface Data {
	code: string;
	template: string;
}

/**
 * Node type
 */
export interface Node {
	type: string;
	name: string;
	attributes: Record<string, any>;
	children: Node[];
	content: string;
}
