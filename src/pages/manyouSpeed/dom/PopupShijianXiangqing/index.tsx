import { forwardRef } from 'react';
import Wrap from '../Warp';
import styles from './index.less';

export interface PopupProps {
  /** 根类名 */
  wrapClassName?: string;
  wrapStyle?: object;
  // 关闭事件
  onClose?: (id?: string | number) => void;
}

const Popup = ({ wrapClassName, wrapStyle, onClose }: PopupProps, ref: any) => {
  return (
    <Wrap
      ref={ref}
      wrapClassName={`${styles.wrap} ${wrapClassName}`}
      wrapStyle={wrapStyle}
      bodyClassName={styles.body}
      title="事件详情"
      width={366.9}
      height={402.3}
      bg={require(`./resources/bg.png`)}
      onClose={() => {
        onClose && onClose();
      }}
    >
      <div className={styles.list}>
        <div className={styles.icon}></div>
        <div className={styles.name}>事件来源:</div>
        <div className={styles.value}></div>
      </div>
      <div className={styles.list}>
        <div className={styles.icon}></div>
        <div className={styles.name}>事件类型:</div>
        <div className={styles.value}>沿街晾挂</div>
      </div>
      <div className={styles.list}>
        <div className={styles.icon}></div>
        <div className={styles.name}>事件名称:</div>
        <div className={styles.value}>沿街晾挂</div>
      </div>
      <div className={styles.list}>
        <div className={styles.icon}></div>
        <div className={styles.name}>时间:</div>
        <div className={styles.value}>2022-5-21&nbsp;&nbsp;17:20:31</div>
      </div>
      <div className={styles.list}>
        <div className={styles.icon}></div>
        <div className={styles.name}>隐患等级:</div>
        <div className={styles.value}>一般</div>
      </div>
      <div className={styles.line}></div>
      <div className={styles.buttonWrap}>
        <div className={styles.buttonLine}>
          <div className={styles.button} onClick={() => console.warn('待核实')}>
            待核实
          </div>
        </div>
        <div className={styles.buttonLine}>
          <div className={styles.button} onClick={() => console.warn('已上报')}>
            已上报
          </div>
        </div>
        <div className={styles.buttonLine}>
          <div
            className={`${styles.button} ${styles.handling}`}
            onClick={() => console.warn('处置中')}
          >
            处置中
          </div>
        </div>
        <div className={styles.buttonLine}>
          <div
            className={`${styles.button} ${styles.handled}`}
            onClick={() => console.warn('已闭环')}
          >
            已闭环
          </div>
        </div>
      </div>
    </Wrap>
  );
};
export default forwardRef(Popup);
