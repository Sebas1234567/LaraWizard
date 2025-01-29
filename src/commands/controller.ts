import { exec } from 'child_process';
import * as vscode from 'vscode';

export function createController(controllerName: string) {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;

    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No se encontró la ruta del proyecto.");
        return;
    }

    exec(`php artisan make:controller ${controllerName}Controller`, { cwd: workspaceFolder }, (err, stdout, stderr) => {
        if (err || stderr) {
            vscode.window.showErrorMessage(`Error al crear el controlador: ${err ? err.message : stderr}`);
        } else {
            vscode.window.showInformationMessage(`Controlador creado con éxito: ${stdout}`);
        }
    });
}
