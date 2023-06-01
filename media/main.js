(function () {
  const vscode = acquireVsCodeApi();
  const root = document.getElementById('root');
  // 右键菜单
  const contextMenu = document.getElementById('contextMenu');
  let activeNode = null;
  let activeNodeInfo = {};

  function contentMenuUnVisible() {
    if (activeNode) {
      activeNode.classList.remove('icon-content--active');
    }
    contextMenu.style.display = 'none';
  }

  // 鼠标点击事件
  root.addEventListener('click', e => {
    const target = e.target;
    const name = target.getAttribute('icon-name');
    if (name) {
      const text = `<Icon icon="\${name}" className="icon" />`;
      const toast = document.getElementById('toast');
      toast.style = 'top: 40px';
      setTimeout(() => {
        toast.style = 'top: -40px';
      }, 2000);
      navigator.clipboard.writeText(text);
    }
  });
  // 阻止鼠标默认右键菜单
  root.oncontextmenu = e => {
    e.preventDefault();
  };
  // 右键菜单
  root.addEventListener('mousedown', e => {
    const target = e.target;
    const name = target.getAttribute('icon-name');
    if (e.button === 2 && name) {
      contextMenu.style.display = 'block';
      contextMenu.style.top = e.clientY + 'px';
      contextMenu.style.left = e.clientX + 'px';
      activeNode = target;
      if (target.tagName !== 'DIV') {
        activeNode = target.parentElement;
      }
      activeNode.classList.add('icon-content--active');
      activeNodeInfo = {
        iconPath: activeNode.getAttribute('icon-path'),
        iconAPath: target.getAttribute('icon-aPath'),
        iconName: target.getAttribute('icon-name'),
        iconClass: target.getAttribute('icon-class'),
        projectName: target.getAttribute('project-name'),
        configPath: target.getAttribute('config-path'),
        rootPath: target.getAttribute('root-path')
      };
    } else {
      contentMenuUnVisible();
    }
  });

  // 右键菜单点击
  contextMenu.addEventListener('click', e => {
    const target = e.target;
    const type = target.getAttribute('data-type');
    vscode.postMessage({ type: type, ...activeNodeInfo });
    contentMenuUnVisible();
  });

  function handleSearch(value) {
    vscode.postMessage({ type: 'search', value });
  }
  // 搜索
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
      handleSearch(searchBox.value);
    }
  });
  document.getElementById('searchBox-button').addEventListener('click', () => {
    handleSearch(searchBox.value);
  });

  if (searchBox.value) {
    searchBox.focus();
    // var range = searchBox.createTextRange();
    // range.moveStart('character', searchBox.value.length);
    // range.collapse();
    // range.select();
    searchBox.selectionStart = searchBox.selectionEnd = searchBox.value.length;
  }
})();
