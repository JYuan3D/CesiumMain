import { Cesium } from '@sl-theia/vis';
import { Button, Slider } from 'antd';
import { useEffect, useRef, useState } from 'react';
import {
  defaultDataValue,
  defaultOpacityValue,
  defaultRadius,
  setHeatmap,
} from './Heatmap';
import styles from './index.less';
import { CesiumHeatmap } from './source';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const heatmapRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const [radius, setRadius] = useState(defaultRadius);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
        selectionIndicator: false,
        animation: false, //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        fullscreenButton: false,
      });
      setHeatmap(
        viewer,
        (cesiumHeatmap: CesiumHeatmap) => {
          heatmapRef.current = cesiumHeatmap;
        },
        (radius: number) => {
          setRadius(radius);
        },
      );
      viewerRef.current = viewer;
      setIsLoadedViewer(true);
    }
  }, []);

  // useEffect(() => {
  //   console.warn('radius:', radius);
  // }, [radius]);

  const onUpdate = (cesiumHeatmap: CesiumHeatmap, value: [number, number]) => {
    cesiumHeatmap.updateHeatMapMaxMin({
      min: value[0],
      max: value[1],
    });
  };

  const onUpdateOpacity = (
    cesiumHeatmap: CesiumHeatmap,
    value: [number, number],
  ) => {
    cesiumHeatmap.updateHeatmap({
      minOpacity: value[0],
      maxOpacity: value[1],
    } as any);
  };

  const onUpdateRadius = (cesiumHeatmap: CesiumHeatmap, value: number) => {
    cesiumHeatmap.updateRadius(value);
  };

  const remove = (cesiumHeatmap: CesiumHeatmap) => {
    cesiumHeatmap?.remove();
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <div className={styles.btnItem}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 8,
            }}
          >
            <span>数值域:</span>
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 8 }}>
            <Slider
              style={{ width: 200 }}
              min={0}
              max={1000}
              range
              defaultValue={defaultDataValue as [number, number]}
              onChange={(value: [number, number]) => {
                onUpdate(heatmapRef.current, value);
              }}
            />
          </div>
        </div>
        <div className={styles.btnItem} style={{ marginTop: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 8,
            }}
          >
            <span>透明度:</span>
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 8 }}>
            <Slider
              style={{ width: 200 }}
              min={0}
              max={1}
              step={0.001}
              range
              defaultValue={defaultOpacityValue as [number, number]}
              onChange={(value: [number, number]) => {
                onUpdateOpacity(heatmapRef.current, value);
              }}
            />
          </div>
        </div>
        <div className={styles.btnItem} style={{ marginTop: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 8,
            }}
          >
            <span>半径:</span>
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 8 }}>
            <Slider
              style={{ width: 200 }}
              step={0.1}
              min={0}
              max={100}
              value={radius}
              onChange={(value: any) => {
                onUpdateRadius(heatmapRef.current, value);
              }}
            />
          </div>
        </div>
        <div className={styles.btnItem} style={{ marginTop: 10 }}>
          <Button type="primary" onClick={() => remove(heatmapRef.current)}>
            删除
          </Button>
          <Button
            type="primary"
            onClick={() => {
              window.location.reload();
            }}
          >
            重载
          </Button>
        </div>
      </div>
    </>
  );
}
