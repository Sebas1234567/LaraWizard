import { exec } from 'child_process';
import * as vscode from 'vscode';

export function createRequest(requestName: string) {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;

    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No se encontró la ruta del proyecto.");
        return;
    }

    exec(`php artisan make:request ${requestName}Request`, { cwd: workspaceFolder }, (err, stdout, stderr) => {
        if (err || stderr) {
            vscode.window.showErrorMessage(`Error al crear el request: ${err ? err.message : stderr}`);
        } else {
            vscode.window.showInformationMessage(`Request creado con éxito: ${stdout}`);
        }
    });
}
