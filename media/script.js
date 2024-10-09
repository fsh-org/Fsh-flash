// Make player fit screen
function fitScreen() {
  let nav = document.getElementById("navbar").getBoundingClientRect();
  window.player.width = window.innerWidth;
  window.player.height = window.innerHeight - nav.height;
}
// Create the ruffle player
window.RufflePlayer = window.RufflePlayer || {};
window.RufflePlayer.config = {
  autoplay: "on",
  unmuteOverlay: "hidden",
  letterbox: "on",
  openUrlMode: "confirm",
  scale: "showAll",
  background: "#181818"
};
// On load set up ruffle
window.addEventListener("load", (event) => {
  // Adding player
  const ruffle = window.RufflePlayer.newest();
  const player = ruffle.createPlayer();
  const container = document.getElementById("container");
  container.appendChild(player);
  // Making public
  window.player = player;
  // Adding extra functions smh
  if (!window.player.volumeControls) window.player.volumeControls = document.querySelector("#container > ruffle-player").shadowRoot.querySelector("#volume-controls-modal");
  if (!window.player.openVolumeControls) window.player.openVolumeControls = function(){window.player.volumeControls.classList.remove('hidden')};
  if (!window.player.closeVolumeControls) window.player.closeVolumeControls = function(){window.player.volumeControls.classList.add('hidden')};
  window.player.toggleVolumeControls = function(){
    window.player.volumeControls.classList.value.includes('hidden') ? window.player.openVolumeControls() : window.player.closeVolumeControls();
  }
  // Force dark mode and our colors
  let style = window.player.shadowRoot.querySelector('style');
  style.innerHTML = style.innerHTML.replace('border:1px solid gray;', 'border-radius:12px;');
  style.innerHTML = style.innerHTML.replace('#context-menu{', '#context-menu{overflow:hidden;');
  style.innerHTML = style.innerHTML.replace('#context-menu .menu-item{', '#context-menu .menu-item{transition:padding 500ms;');
  style.innerHTML = style.innerHTML.replace('#context-menu .menu-item:not(.disabled):hover{', '#context-menu .menu-item:not(.disabled):hover{padding:5px 10px 5px 14px;');
  // Add resie event listener and size player
  window.addEventListener('resize', fitScreen);
  fitScreen()
});

// When file dropped
function dropHandler(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  document.getElementById('style').innerHTML = ``;

  if (ev.dataTransfer.items) {
    for (let i = 0; i<ev.dataTransfer.items.length; i++) {
      if (ev.dataTransfer.items[i].kind === "file") {
        const file = ev.dataTransfer.items[i].getAsFile();
        if (file.type != 'application/x-shockwave-flash') {
          alert('File must be shockwave flash')
          return;
        }
        window.player.load(URL.createObjectURL(file));
        document.getElementById('container').focus();
        fitScreen()
      }
    };
  } else {
    ev.dataTransfer.files.forEach((file, i) => {
      window.player.load(URL.createObjectURL(file));
      document.getElementById('container').focus();
      fitScreen()
    });
  }
}

// When file dragged over screen
function dragOverHandler(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  document.getElementById('selection').close();
  document.getElementById('style').innerHTML = `#sub {
    display:block !important;
    transform: translate(-50%, -50%);
    padding: 50px;
    border-radius: 1rem;
    background-color: #224;
    text-align: center;
    font-size: 40px;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 9999999;
  }`;
}
// When dragged file leaves
function dragLeaveHandler(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  document.getElementById('style').innerHTML = ``;
}
// Pre process files
function fileHandle(ev) {
  document.getElementById('selection').close();
  ob = {
    stopPropagation: function(){},
    preventDefault: function(){},
    dataTransfer: {
      files: Array.from(ev.target.files)
    }
  };
  dropHandler(ob)
}
// URL
function urlHandle(url) {
  document.getElementById('selection').close();
  fetch('https://api.fsh.plus/file?url='+encodeURIComponent(url))
    .then(res=>res.arrayBuffer())
    .then(res=>{
      let file = new File([res], "file.swf");
      ob = {
        stopPropagation: function(){},
        preventDefault: function(){},
        dataTransfer: {
          files: Array.from([file])
        }
      };
      dropHandler(ob)
    })
}
let searchParams = new URLSearchParams(location.search);
window.addEventListener("DOMContentLoaded", () => {
  if (searchParams.has('url')) {
    urlHandle(searchParams.get('url'));
  }
});
