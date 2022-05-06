// Modify Window and typeof globalThis

interface Spinhat {
  patcher: {
    patch: () => Promise<boolean>;
    unpatch: () => Promise<boolean>;
    isPatched: (lazy:? boolean) => Promise<number>;
  },
  downloader: {
    download: () => Promise<string>;
    update: (force:? boolean) => Promise<number | UpdateResult>;
    uninstall: () => Promise<boolean | null>;
  },
  git: {
    getLocalCommit: () => Promise<GitLog>;
    getRemoteCommit: () => Promise<GitLog>;
    getChanges: () => Promise<GitChange[]>;
  },
  window: {
    close: () => void;
    minimize: () => void;
    dialog: {
      showErrorBox: (title: string, content: string) => void;
      showMessageBox: (title: string, content: string) => void;
    }
  }
}

interface GitLog {
  hash: string;
  author: string;
  message: string;
  date: Date;
}

interface GitChange {
  change: string;
  file: string;
}

enum DownloadResult {
  success = "success",
  failure = "failure",
  alreadyInstalled = "already installed"
}

enum UpdateResult {
  fetchSuccessful = 1,
  fetchFailed = 0,
  notInstalled = null,
  upToDate = -1,
  unstagedChanges = -2
}

enum UninstallResult {
  uninstallSuccessful = true,
  uninstallFailed = false,
  notInstalled = null
}
