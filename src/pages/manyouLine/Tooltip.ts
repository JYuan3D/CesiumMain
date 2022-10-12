type Tooltip = {
  position?: {
    x: number;
    y: number;
  };
  text?: string;
  show: boolean;
};

const Tooltip = ({
  position = { x: 0, y: 0 },
  text = '鼠标左键操作,右键结束',
  show = false,
}: Tooltip) => {
  let QureyltipMove = document.getElementById('cesiumTooltip');
  if (!QureyltipMove) {
    QureyltipMove = document.createElement('div');
    QureyltipMove.setAttribute('id', 'cesiumTooltip');
    QureyltipMove.innerHTML = text;
    document.body.append(QureyltipMove);
  }

  QureyltipMove.style.cssText = `
    display:${show ? 'block' : 'none'};
          position:absolute;
          left:0;
          top:0;
          padding:8px 10px;
          font-size:14px;
          background:rgba(0,0,0,0.7);
          color:white;
          transform:translate3d(${+Math.round(position.x) + 10}px,${
    +Math.round(position.y) + 10
  }px, 0);
  `;
};

export default Tooltip;
