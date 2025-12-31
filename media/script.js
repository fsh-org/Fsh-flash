// Make player fit screen
function fitScreen() {
  let nav = document.getElementById('navbar').getBoundingClientRect();
  window.player.width = window.innerWidth;
  window.player.height = window.innerHeight - nav.height;
}

// Create the ruffle player
window.RufflePlayer ??= {};
window.RufflePlayer.config = {
  polyfills: false,
  allowScriptAccess: false,

  base: location.href,
  playerRuntime: (localStorage.getItem('air')==='true')?'air':'flashPlayer',
  playerVersion: parseInt(localStorage.getItem('ver'))||32,
  urlRewriteRules: (localStorage.getItem('proxy')==='false')?[]:[
    [/^https?:\/\/(.*$)/, 'https://api.fsh.plus/file?url=https://$1']
  ],

  autoplay: 'on',
  unmuteOverlay: 'hidden',
  backgroundColor: 'var(--bg-1)',
  wmode: 'opaque',
  letterbox: 'on',
  showSwfDownload: true,
  maxExecutionDuration: 30,
  scale: 'showAll',
  openUrlMode: 'confirm',
  allowFullscreen: true
};
// On load set up ruffle
window.addEventListener('load', () => {
  // Adding player
  const ruffle = window.RufflePlayer.newest();
  const player = ruffle.createPlayer();
  const container = document.getElementById("container");
  container.appendChild(player);
  window.player = player;
  // Adding extra functions smh
  window.player.volumeControls ??= document.querySelector("#container > ruffle-player").shadowRoot.querySelector("#volume-controls-modal");
  window.player.openVolumeControls ??= ()=>{window.player.volumeControls.classList.remove('hidden')};
  window.player.closeVolumeControls ??= ()=>{window.player.volumeControls.classList.add('hidden')};
  window.player.toggleVolumeControls = function(){
    window.player.volumeControls.classList.value.includes('hidden') ? window.player.openVolumeControls() : window.player.closeVolumeControls();
  }
  // Force dark mode and our colors
  let style = window.player.shadowRoot.querySelector('style');
  style.innerHTML = style.innerHTML
    .replace('border:1px solid gray;', 'border-radius:12px;')
    .replace('#context-menu{', '#context-menu{overflow:hidden;')
    .replace('#context-menu .menu-item{', '#context-menu .menu-item{transition:padding 500ms;')
    .replace('#context-menu .menu-item:not(.disabled):hover{', '#context-menu .menu-item:not(.disabled):hover{padding:5px 10px 5px 14px;');
  // Add resie event listener and size player
  window.addEventListener('resize', fitScreen);
  fitScreen();
  // Auto url
  let searchParams = new URLSearchParams(location.search);
  if (searchParams.has('url')) {
    urlHandle(searchParams.get('url'));
  }
});

// Loading files
function loadUrl(url) {
  document.getElementById('sub').style.display = '';
  document.getElementById('selection').close();

  window.player.load(url);
  document.getElementById('container').focus();
  fitScreen();
}

// Drop handler
const swfFileTypes = ['application/x-shockwave-flash',''];
function dropHandler(ev) {
  ev.stopPropagation?.();
  ev.preventDefault?.();

  if (ev.dataTransfer.items) {
    for (let i = 0; i<ev.dataTransfer.items.length; i++) {
      if (ev.dataTransfer.items[i].kind!=='file') continue;
      const file = ev.dataTransfer.items[i].getAsFile();
      if (!swfFileTypes.includes(file.type)) {
        window.player?.displayMessage('File must be shockwave flash');
        continue;
      }
      loadUrl(URL.createObjectURL(file));
    }
  } else {
    ev.dataTransfer.files = ev.dataTransfer.files.filter(file=>swfFileTypes.includes(file.type));
    if (ev.dataTransfer.files.length<1) {
      window.player?.displayMessage('File must be shockwave flash');
      return;
    }
    loadUrl(URL.createObjectURL(ev.dataTransfer.files[0]));
  }
}

// Drag handler
function dragHandler(ev, dis='') {
  ev.stopPropagation();
  ev.preventDefault();
  document.getElementById('selection').close();
  setTimeout(()=>{
    document.getElementById('sub').style.display = dis;
  }, (dis===''?50:0));
}

// Uploaded files
function fileHandle(ev) {
  document.getElementById('selection').close();
  ob = {
    dataTransfer: {
      files: Array.from(ev.target.files)
    }
  };
  dropHandler(ob);
}

// URL load
function urlHandle(url) {
  loadUrl('https://api.fsh.plus/file?url='+encodeURIComponent(url));
}
