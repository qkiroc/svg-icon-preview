export function viewFile(icon: IconProps) {
  window.vscode.postMessage({
    type: 'view',
    data: {
      path: icon.aPath
    }
  });
}

export function optimizeIcon(icon: IconProps) {
  window.vscode.postMessage({
    type: 'optimization',
    data: {
      iconAPath: icon.aPath
    }
  });
}
