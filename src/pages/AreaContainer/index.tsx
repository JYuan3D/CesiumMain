import { Cesium } from '@sl-theia/vis';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { data } from './utils/data';
import { drawPolygon } from './utils/drawPolygon';
import { drawWall } from './utils/setWall';
import styles from './index.less';


let _points: any = [];


export interface AreaContainerProps {
  points?: Array<[]>;
  viewer: Cesium.Viewer;
  isLoaded: boolean;
}

const AreaContainer = (
  { viewer, isLoaded }: AreaContainerProps,
  ref: any,
) => {
  const areaRef = useRef<any>({});
  const lastActiveAreaRef = useRef<any>(null);
  const [activeArea, setActiveArea] = useState<keyof typeof data | null>(null);

  useEffect(() => {
    if (viewer && isLoaded) {
      const key = Object.keys(data);
      //@ts-ignore
      key.forEach((key: keyof typeof data) => {
        const polygon = drawPolygon({
          data: data[key],
          viewer,
          color: new Cesium.Color(0 / 255, 69 / 255, 244 / 255, 0.3),
        });
        const wall = drawWall({
          viewer,
          option: {
            color: new Cesium.Color(36 / 255, 195 / 255, 240 / 255, 1),
            show: true,
            positions: data[key],
            wallHeight: 100,
            hasHeight: true,
          },
        });
        wall.show = false;
        areaRef.current[key] = {
          polygon,
          wall,
        };
      });
      drawWallByGeoName('A');
    }
  }, [viewer, isLoaded]);


  const drawWallByGeoName = useCallback(
    (activeArea: any) => {
      if (activeArea === null) {
        return;
      }
      const area = areaRef.current[activeArea];
      const lastActiveArea = areaRef.current[lastActiveAreaRef.current];
      console.log(area);
      if (lastActiveAreaRef.current && lastActiveArea) {
        lastActiveArea.polygon.polygon.fill = true;
        lastActiveArea.wall.show = false;
      }
      if (area.wall) {
        area.polygon.polygon.fill = false;
        area.wall.show = true;
      }
      lastActiveAreaRef.current = activeArea;
    },
    [activeArea],
  );

  return (
    <div className={styles.btnWrap}>
      <button
        onClick={() => {
          _points = [];
        }}
      >
        开始打点
      </button>
      <button
        onClick={() => {
          console.log(_points);
          console.log(JSON.stringify(_points));
        }}
      >
        结束打点
      </button>
      <button
        onClick={() => {
          drawWallByGeoName('A');
        }}
      >
        高亮A区
      </button>
      <button
        onClick={() => {
          drawWallByGeoName('B');
        }}
      >
        高亮B区
      </button>
      <button
        onClick={() => {
          drawWallByGeoName('C');
        }}
      >
        高亮C区
      </button>
      <button
        onClick={() => {
          drawWallByGeoName('D');
        }}
      >
        高亮D区
      </button>
    </div>
  );
};

export default React.forwardRef(AreaContainer);
