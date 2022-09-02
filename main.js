///@ts-nocheck

GMEdit.register('room-order', {
  init: function () {
    GMEdit.on('projectOpen', ({ project }) => {
      const element = $gmedit['ui.treeview.TreeView'].makeItem('Room Order');

      element.addEventListener('click', () => {
        OpenRoomOrderPage(project);
      });

      $gmedit['ui.treeview.TreeView'].element.appendChild(element);
    });
  },
});

function OpenRoomOrderPage(yyProject) {
  const project = getYYProject(yyProject.path);

  const file = new $gmedit['gml.file.GmlFile'](
    'Room Order',
    null,
    $gmedit['file.kind.gml.KGmlSearchResults'].inst,
    '',
  );

  const page = document.createElement('div');

  page.innerHTML = `<h1>Drag the item to change the order of the rooms</h1><h5>When you change an order, it is automatically saved</h5>`;

  page.className = 'room-order-container';

  const list = document.createElement('ul');

  list.addEventListener(`dragstart`, (evt) => {
    evt.target.classList.add(`selected`);
  });

  list.addEventListener(`dragend`, (evt) => {
    evt.target.classList.remove(`selected`);
    saveProject();
  });

  list.addEventListener(`dragover`, (evt) => {
    evt.preventDefault();

    const activeElement = list.querySelector(`.selected`);
    const currentElement = evt.target;
    const isMoveable =
      activeElement !== currentElement && currentElement.classList.contains(`room-item`);
    if (!isMoveable) {
      return;
    }

    const nextElement = getNextElement(evt.clientY, currentElement);
    if (
      (nextElement && activeElement === nextElement.previousElementSibling) ||
      activeElement === nextElement
    ) {
      return;
    }

    list.insertBefore(activeElement, nextElement);
    
  });

  const saveProject = () => {
    const items = Array.from(list.children).map((item) => item.innerText);
    const RoomOrderNodes = items.map((room) => ({
      roomId: { name: room, path: `rooms/${room}/${room}.yy` },
    }));
    project.RoomOrderNodes = RoomOrderNodes;
    saveYYProject(yyProject.path, project);
  };

  project.RoomOrderNodes.forEach((room) => {
    const li = document.createElement('li');
    li.innerText = room.roomId.name;
    li.draggable = true;
    li.className = 'room-item';

    list.appendChild(li);
  });

  page.appendChild(list);

  file.editor.element = page;
  $gmedit['gml.file.GmlFile'].openTab(file);
}

function getYYProject(path) {
  const data = Electron_FS.readFileSync(path, 'utf-8');
  return $gmedit['yy.YyJson'].parse(data);
}
function saveYYProject(path, data) {
  Electron_FS.writeFileSync(path, $gmedit['yy.YyJsonPrinter'].stringify(data, true));
}

const getNextElement = (cursorPosition, currentElement) => {
  const currentElementCoord = currentElement.getBoundingClientRect();
  const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

  const nextElement =
    cursorPosition < currentElementCenter ? currentElement : currentElement.nextElementSibling;

  return nextElement;
};
