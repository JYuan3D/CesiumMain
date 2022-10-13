import { useState } from 'react';
import Wrap from '../Warp';
import styles from './index.less';

export interface PopupProps {
  wrapClassName: string;
  onConfirm: Function;
  onClose: Function;
}

const Popup: React.FC<PopupProps> = ({ wrapClassName, onConfirm, onClose }) => {
  const [value, setValue] = useState('');
  return (
    <Wrap
      wrapClassName={`${styles.wrap} ${wrapClassName}`}
      bodyClassName={styles.body}
      title="巡航路线设置"
      width={459.8}
      height={213.6}
      bg={require(`./resources/bg.png`)}
      onClose={() => {
        console.warn('123456');
        onClose && onClose();
      }}
    >
      <div className={styles.list}>
        <div className={styles.icon}></div>
        <div className={styles.name}>路线名称:</div>
        <div className={`${styles.value}`}>
          <input
            type="text"
            className={styles.itemInput}
            onChange={(e) => setValue(e.target.value)}
          ></input>
        </div>
      </div>
      <div
        className={styles.button}
        onClick={() => {
          onConfirm(value);
        }}
      >
        确认
      </div>
    </Wrap>
  );
};
export default Popup;
