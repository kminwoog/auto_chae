import * as vscode from 'vscode';

// 개발 환경에서만 활성화할 OutputChannel
let outputChannel: vscode.OutputChannel | null = null;

// 로그 출력 함수
function logMessage(message: string) {
    const enableLogging = vscode.workspace.getConfiguration().get('auto-chae.enableLogging', false);

    if (enableLogging) {
        if (!outputChannel) {
            outputChannel = vscode.window.createOutputChannel('auto-chae');
        }
        outputChannel.appendLine(message);
        outputChannel.show();
    }
}

export function manageAutoRequires(document: vscode.TextDocument): vscode.WorkspaceEdit | undefined {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const text = document.getText();
    const config = vscode.workspace.getConfiguration('auto-chae');
    const majorRegexPattern = config.get<string>('majorRegexPattern') || '(Cms\\.[\\w]+)\\.(rec|match|match_object|match_delete|match_limit|select|select_replace|select_delete|select_limit|select_count)\\(';
    const minorRegexPattern = config.get<string>('minorRegexPattern') || '([.\\w]+)\\.(packet!|msg|rec|send)\\(';
    const requireScopePattern = config.get<string>('requireScopePattern') || '([ \\t]*)# >{1,} auto([\\s\\S]*?)# <{1,} auto';
    const excludeModules = config.get<string[]>('excludeModules') || [];

    logMessage('majorRegexPattern:' + majorRegexPattern);
    logMessage('minorRegexPattern:' + minorRegexPattern);
    logMessage('requireScopePattern:' + requireScopePattern);
    logMessage('excludeModules:' + excludeModules);

    // 찾을 수 있는 모듈 목록 (후보군 매크로에서 추출)
    const moduleMatches1 = [...text.matchAll(new RegExp(majorRegexPattern, 'g'))];
    const moduleMatches2 = [...text.matchAll(new RegExp(minorRegexPattern, 'g'))];
    const usedModules1 = Array.from(new Set(moduleMatches1.map(match => match[1])))
        .filter(module => !excludeModules.includes(module)).sort();
    const usedModules2 = Array.from(new Set(moduleMatches2.map(match => match[1])))
        .filter(module => !usedModules1.includes(module) && !excludeModules.includes(module)).sort();

    const newAutoRequires = [
        ...usedModules1,
        ...usedModules2
    ];

    // const autoRequirePattern = /([ \t]*)# >{1,} auto([\s\S]*?)# <{1,} auto/g;
    const autoRequirePattern = new RegExp(requireScopePattern, 'g');
    const match = autoRequirePattern.exec(text);

    if (!match) {
        logMessage(`${autoRequirePattern} match is null`);
        return;
    }

    const leadingWhitespace = match[1];  // # 앞의 공백을 추출
    logMessage('leadingWhitespace' + leadingWhitespace);

    // 정렬된 require 구문을 다시 한 번 공백을 고려하여 작성
    const indentedRequires = newAutoRequires
        .map(line => `${leadingWhitespace}require ${line}`)  // 정렬된 require 구문에 들여쓰기 적용
        .join('\n');

    const newText = text.replace(text, `${leadingWhitespace}# >>>>>>> auto\n${indentedRequires}\n${leadingWhitespace}# <<<<<<< auto`);

    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
    edit.replace(document.uri, fullRange, newText);

    return edit;
}
