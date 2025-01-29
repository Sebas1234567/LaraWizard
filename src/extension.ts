import * as vscode from 'vscode';
import * as path from "path";
import * as fs from "fs";
import { createMigration } from './commands/migration';
import { createModel } from './commands/model';
import { createRequest } from './commands/request';
import { createController } from './commands/controller';

class LaravelFileProvider implements vscode.TreeDataProvider<LaravelFileItem>
{
    private _onDidChangeTreeData: vscode.EventEmitter<LaravelFileItem | undefined | void> = new vscode.EventEmitter<LaravelFileItem | undefined | void>();

    readonly onDidChangeTreeData: vscode.Event<LaravelFileItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private directory: string, private name: string) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: LaravelFileItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<LaravelFileItem[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return Promise.resolve([]);
        }

        const dirPath = path.join(workspaceFolder.uri.fsPath, this.directory);
        if (!fs.existsSync(dirPath)) {
            return Promise.resolve([]);
        }

        let type: "model" | "request" | "controller";
        switch (this.name) {
            case "Modelos":
                type = "model";
                break;
            case "Requests":
                type = "request";
                break;
            case "Controllers":
                type = "controller";
                break;
        }

        // Obtener TODOS los archivos PHP dentro de la carpeta (incluyendo subcarpetas)
        const files = this.getAllPhpFiles(dirPath).map(file => 
            new LaravelFileItem(path.basename(file), file, type, vscode.TreeItemCollapsibleState.None)
        );

        return Promise.resolve(files);
    }

    private getAllPhpFiles(dir: string): string[] {
        let results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            var fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results = results.concat(this.getAllPhpFiles(fullPath)); 
            } else if (entry.isFile() && entry.name.endsWith(".php")) {
                results.push(fullPath);
            }
        }

        return results;
    }
}

class LaravelFileItem extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly filePath: string, public readonly type: "model" | "request" | "controller", collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);

        const iconPath = path.join(__filename, "..", "..", "resources", "icons", "php.svg");
        this.iconPath = vscode.Uri.file(iconPath);

        this.tooltip = `${this.label}`;
        this.description = vscode.workspace.asRelativePath(path.dirname(this.filePath));

        this.command = {
            command: "vscode.open",
            title: "Abrir Archivo",
            arguments: [vscode.Uri.file(filePath)]
        };
    }
}

async function createLaravelFile(type: string) {
    if (type === "model") {
        const modelName = await vscode.window.showInputBox({ prompt: "Nombre del Modelo" });
        if (modelName) {
            const addMigration = await vscode.window.showQuickPick(["Sí", "No"], { placeHolder: "¿Crear migración?" });
            if (addMigration === 'Sí') {
                createMigration(`create${modelName}_table`);
                createModel(modelName);
            } else {
                createModel(modelName);
            }
        }
    } else if (type === "request") {
        const requestName = await vscode.window.showInputBox({ prompt: "Nombre del Request" });
        if (requestName) {
            createRequest(requestName);
        }
    } else if (type === "controller") {
        const controllerName = await vscode.window.showInputBox({ prompt: "Nombre del Controller" });
        if (controllerName) {
            createController(controllerName);
        }
    } else if (type === "all") {
        const name = await vscode.window.showInputBox({ prompt: "Nombre de la tabla" });
        if (name) {
            createMigration(`create${name}_table`);
            createModel(name);
            createRequest(`${name}Request`);
            createController(`${name}Controller`);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    vscode.window.registerTreeDataProvider("larawizard-models",new LaravelFileProvider("app/Models", "model"));

    vscode.window.registerTreeDataProvider("larawizard-requests",new LaravelFileProvider("app/Http/Requests", "request"));

    vscode.window.registerTreeDataProvider("larawizard-controllers",new LaravelFileProvider("app/Http/Controllers", "controller"));
    
    context.subscriptions.push(vscode.commands.registerCommand("larawizard.createModel", () => createLaravelFile("model")));

    context.subscriptions.push(vscode.commands.registerCommand("larawizard.createRequest", () => createLaravelFile("request")));

    context.subscriptions.push(vscode.commands.registerCommand("larawizard.createController", () => createLaravelFile("controller")));

    context.subscriptions.push(vscode.commands.registerCommand("larawizard.createAll", () => createLaravelFile("all")));
}

export function deactivate() {}