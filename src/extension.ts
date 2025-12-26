// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('TypeScript File Maker extension is now active!');

	// Register the command to create a new TypeScript file
	const disposable = vscode.commands.registerCommand('typescript-file-maker.createTypeScriptFile', async () => {
		// Get the active workspace folder
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('Please open a workspace folder first');
			return;
		}

		// Prompt user for file name
		const fileName = await vscode.window.showInputBox({
			prompt: 'Enter TypeScript file name (without .ts extension)',
			placeHolder: 'my-component',
			validateInput: (value) => {
				if (!value) {
					return 'File name is required';
				}
				if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
					return 'File name can only contain letters, numbers, hyphens, and underscores';
				}
				return null;
			}
		});

		if (!fileName) {
			return;
		}

		// Prompt user to select a template
		const template = await vscode.window.showQuickPick([
			{ label: 'Basic TypeScript File', value: 'basic' },
			{ label: 'Class', value: 'class' },
			{ label: 'Interface', value: 'interface' },
			{ label: 'Function', value: 'function' },
			{ label: 'React Component', value: 'react' }
		], {
			placeHolder: 'Select a template'
		});

		if (!template) {
			return;
		}

		// Generate content based on template
		const content = generateTemplate(fileName, template.value);

		// Get the directory to save the file (use active editor's directory or workspace root)
		let targetDir: vscode.Uri;
		if (vscode.window.activeTextEditor) {
			const activeFileDir = path.dirname(vscode.window.activeTextEditor.document.uri.fsPath);
			targetDir = vscode.Uri.file(activeFileDir);
		} else {
			targetDir = workspaceFolders[0].uri;
		}

		// Create the file URI
		let fileUri = vscode.Uri.file(path.join(targetDir.fsPath, `${fileName}.ts`));
		if (template.value === 'react') {
			fileUri = vscode.Uri.file(path.join(targetDir.fsPath, `${fileName}.tsx`));
		}

		// Create the file using WorkspaceEdit
		const edit = new vscode.WorkspaceEdit();
		edit.createFile(fileUri, { ignoreIfExists: false, contents: Buffer.from(content, 'utf-8') });

		try {
			await vscode.workspace.applyEdit(edit);
			// Open the file
			const document = await vscode.workspace.openTextDocument(fileUri);
			await vscode.window.showTextDocument(document);
			vscode.window.showInformationMessage(`Created ${fileName}.ts`);
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to create file: ${error}`);
		}
	});

	context.subscriptions.push(disposable);

}

/**
 * Generate file content based on template type
 */
function generateTemplate(fileName: string, templateType: string): string {
	const pascalCase = toPascalCase(fileName);
	const camelCase = toCamelCase(fileName);

	switch (templateType) {
		case 'class':
			return `/**
 * ${pascalCase} class
 */
export class ${pascalCase} {
	constructor() {
		// TODO: Initialize
	}

	// TODO: Add methods
}
`;

		case 'interface':
			return `/**
 * ${pascalCase} interface
 */
export interface ${pascalCase} {
	// TODO: Define properties
}
`;

		case 'function':
			return `/**
 * ${camelCase} function
 * @param {any} param - Description
 * @returns {any} Description
 */
export function ${camelCase}(param: any): any {
	// TODO: Implement function
	return param;
}
`;

		case 'react':
			return `import React from 'react';

interface ${pascalCase}Props {
	// TODO: Define props
}

/**
 * ${pascalCase} component
 */
export const ${pascalCase}: React.FC<${pascalCase}Props> = (props) => {
	return (
		<div>
			{/* TODO: Implement component */}
		</div>
	);
};
`;

		case 'basic':
		default:
			return `/**
 * ${fileName}
 * 
 * @description Add description here
 */

// TODO: Add your code here
`;
	}
}

/**
 * Convert kebab-case or snake_case to PascalCase
 */
function toPascalCase(str: string): string {
	return str
		.split(/[-_]/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('');
}

/**
 * Convert kebab-case or snake_case to camelCase
 */
function toCamelCase(str: string): string {
	const pascal = toPascalCase(str);
	return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// This method is called when your extension is deactivated
export function deactivate() { }
