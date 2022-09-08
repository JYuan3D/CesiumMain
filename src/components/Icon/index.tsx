import { useRef, useEffect, useState, useMemo } from 'react';
import './index.less';
import { mergecssname } from '@sl-theia/theia-utils';

export interface IconProps {
  /**  根类名 */
  className?: string;
  /** 根样式 */
  style?: React.CSSProperties;
  /** 颜色 */
  color?: string;
  /** icon 地址 */
  icon: string;
}
/**
 * 使用滤镜支持图片变色
 * tip:使用前请考虑谷歌版本兼容
 */
const Icon: React.FC<IconProps> = (props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setOffset(imgRef.current?.width || 0);
  }, [imgRef]);

  const classNames = useMemo(
    () => mergecssname({}, ['vis-icon', props.className]),
    [props.className],
  );

  return (
    <div className={classNames} style={props.style}>
      <img
        src={props.icon}
        ref={imgRef}
        style={
          props.color
            ? {
                filter: `drop-shadow(${props.color} ${offset}px 0)`,
                transform: `translate(-100%,0)`,
              }
            : {}
        }
      />
    </div>
  );
};

export default Icon;
