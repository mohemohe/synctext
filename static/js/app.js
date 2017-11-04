let socket = null;

window.addEventListener('load', () => {
  localStorage.debug = '*';
  setInterval(() => {
    if(socket) {
      if(socket.connected) {
        document.querySelectorAll('.connect').forEach((item) => {
          item.classList.add('disabled');
          item.innerHTML = '接続中';
        });
      } else {
        document.querySelectorAll('.connect').forEach((item) => {
          item.innerHTML = '再接続中';
        });
      }
    }
  }, 1000);
});

document.querySelectorAll('.connect').forEach((item) => {
  item.addEventListener('click', () => {
    let id = '';
    document.querySelectorAll('.id').forEach((item) => {
      if(item.value && !isNaN(parseInt(item.value, 10))) {
        id = item.value.replace(/-/g, '');
      }
    });
    if(socket !== null) {
      console.warn('already connected. ignore.');
      return;
    }
    socket = io(`${location.protocol}//${location.host}${location.pathname}?id=${id}`);

    socket.on('message', (data) => {
      console.info(data);
      if(data.sendBy === socket.id) {
        console.warn('update event received from self. ignore.');
        return;
      }
      if(data && data.id) {
        document.querySelectorAll('.id').forEach((item) => {
          if(!isNaN(parseInt(data.id, 10))) {
            item.value = `${data.id}`.replace(/([\d]{4})/g, '-$1').substr(1);
          } else {
            item.value = data.id;
          }
        });
      }
      if(data && data.value) {
        document.querySelector('#textarea').value = data.value;
      }
      $('#textarea').trigger('autoresize');
    });

    document.querySelector('#textarea').addEventListener('keyup', () => {
      const text = document.querySelector('#textarea').value;
      socket.emit('message', {
        id: id,
        value: text
      });
    });
  });
});
