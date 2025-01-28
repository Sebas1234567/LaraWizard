import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	// Comando para crear una migración
    const disposableMigration = vscode.commands.registerCommand('larawizard.createMigration', () => {
        vscode.window.showInputBox({ prompt: 'Nombre de la migración' }).then((migrationName) => {
            if (migrationName) {
                exec(`php artisan make:migration ${migrationName}`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Error: ${stderr}`);
                    } else {
                        vscode.window.showInformationMessage(`Migración creada: ${migrationName}`);
                    }
                });
            }
        });
    });

    // Comando para crear un controlador
    const disposableController = vscode.commands.registerCommand('larawizard.createController', () => {
        vscode.window.showInputBox({ prompt: 'Nombre del controlador' }).then((controllerName) => {
            if (controllerName) {
                exec(`php artisan make:controller ${controllerName}`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Error: ${stderr}`);
                    } else {
                        vscode.window.showInformationMessage(`Controlador creado: ${controllerName}`);
                    }
                });
            }
        });
    });

    // Registrar los comandos en el contexto de la extensión
    context.subscriptions.push(disposableMigration);
    context.subscriptions.push(disposableController);
}

export function deactivate() {}