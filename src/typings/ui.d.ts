declare module globalThis {
  let SpinHat: SpinHat;
}

// oh why do i even bother
declare namespace uiScript {

  declare function heehoo {
    const $commitStatus: HTMLDivElement;
    async function checkCommits(): Promise<boolean>;
  }

  declare namespace checkCommits {
    const localCommit: GitLog
  }
}

