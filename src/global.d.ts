export {};
declare global {
  interface Window {
    vscode: {
      postMessage: (message: { type: messageType; data: any }) => void;
    };
    projectConfig?: ProjectConfig;
    icons?: IconProps[];
    search?: string;
  }
}
