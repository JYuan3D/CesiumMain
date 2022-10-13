import styles from './index.less';

export interface TabProps {
  warpStyle: object;
  contentStyle?: object;
  bg: string;
  name: string;
}

const Tab: React.FC<TabProps> = ({ warpStyle, contentStyle, bg, name }) => {
  return (
    <div
      className={styles.wrap}
      style={{
        ...warpStyle,
        backgroundImage: `url(${require(`./resources/${bg}`)})`,
      }}
    >
      <div className={`${styles.content}`} style={contentStyle}>
        {name}
      </div>
    </div>
  );
};

export default Tab;
