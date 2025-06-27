import { TreeNode } from 'react-file-navigator';

export class PathUtility {
	private static instance: PathUtility | null = null;
	private tree: TreeNode[] = [];

	private constructor() {}

	public static createInstance() {
		if (!PathUtility.instance) {
			PathUtility.instance = new PathUtility();
		}
		return PathUtility.instance;
	}

	public static getInstance(): PathUtility {
		if (!PathUtility.instance) {
			throw new Error('PathUtility instance not created. Call createInstance() first.');
		}
		return PathUtility.instance;
	}

	public updateTree(newTree: TreeNode[]): void {
		this.tree = newTree;
	}

	public getTree(): TreeNode[] {
		return this.tree;
	}

	public findFilePathById(targetId: string): string {
		let filePath = null;

		const searchFile = (nodes: TreeNode[], currentPath: string) => {
			for (const node of nodes) {
				const newPath = currentPath === '' ? node.name : `${currentPath}/${node.name}`;
				if (node.id == targetId) {
					filePath = `./${newPath}`;
					return;
				}

				if (node.children && node.children.length > 0) {
					searchFile(node.children, newPath);
				}
			}
		};

		searchFile(this.tree, '');

		if (filePath === null) {
			console.log(`File with ID ${targetId} not found.`);
			return '';
		}

		return filePath;
	}
}
