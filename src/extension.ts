// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { manageAutoRequires } from './autoRequireHelper'; // 관리할 함수 경로

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.auto-chae', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const edit = manageAutoRequires(editor.document);
			if (edit) {
				await vscode.workspace.applyEdit(edit);
				vscode.window.showInformationMessage('Auto requires updated successfully!');
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
