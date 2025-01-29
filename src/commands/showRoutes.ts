import { exec } from 'child_process';
import * as vscode from 'vscode';

export function showRoutes() {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;

    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No se encontró la ruta del proyecto.");
        return;
    }

    exec('php artisan route:list', { cwd: workspaceFolder }, (err, stdout, stderr) => {
        if (err || stderr) {
            vscode.window.showErrorMessage(`Error al obtener las rutas: ${err ? err.message : stderr}`);
        } else {
            const outputChannel = vscode.window.createOutputChannel('Laravel Routes');
            outputChannel.appendLine(stdout);
            outputChannel.show();
        }
    });
}
