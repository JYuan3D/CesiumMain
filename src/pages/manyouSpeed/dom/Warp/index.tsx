import styles from './index.less';

export interface WrapProps {
  /** 根类名 */
  wrapClassName?: string;
  /** 主类名 */
  bodyClassName?: string;
  // 标题
  title: string;
  // 背景
  bg?: string;
  width?: number;
  height?: number | string;
  // 唯一标识
  id?: string | number;
  // 关闭事件
  onClose?: (id?: string | number) => void;
  children?: any;
}

const Wrap: React.FC<WrapProps> = ({
  wrapClassName,
  bodyClassName,
  title,
  bg = require(`./resources/bg.png`),
  onClose,
  id,
  width = 200,
  height = 'auto',
  children,
}) => {
  return (
    <div
      className={`${styles.wrap} ${wrapClassName}`}
      style={{ width, height, backgroundImage: `url(${bg})` }}
    >
      <div className={styles.header}>
        {title}
        {onClose && <img src={require(`./resources/close.png`)} onClick={() => onClose?.(id)} />}
      </div>
      <div className={`${styles.body} ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Wrap;
