import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const length = 100;
  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
        contextOptions: {
          webgl: {
            alpha: true,
          },
        },
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
      viewerRef.current = viewer;

      // 取消双击事件
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
      );

      // 设置homebutton的位置
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        // Rectangle(west, south, east, north)
        110.15,
        34.54,
        110.25,
        34.56,
      );

      setArea(viewer);

      setIsLoadedViewer(true);
    }
  }, []);

  const setArea = (viewer: Cesium.Viewer) => {
    let instances = [];
    for (let lon = -180.0; lon < 180.0; lon += 5.0) {
      for (let lat = -90.0; lat < 90.0; lat += 5.0) {
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
              rectangle: Cesium.Rectangle.fromDegrees(
                lon,
                lat,
                lon + 5.0,
                lat + 5.0,
              ),
            }),
            id: lon + '-' + lat,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 0.5,
                }),
              ),
            },
          }),
        );
      }
    }
    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: instances, //合并
        releaseGeometryInstances: false,
        //某些外观允许每个几何图形实例分别指定某个属性，例如：
        appearance: new Cesium.PerInstanceColorAppearance(),
      }),
    );
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(105.2, 30.55, 5000000),
    });
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement: any) {
      let pick = viewer.scene.pick(movement.position);
      let attributes = pick.primitive.getGeometryInstanceAttributes(pick.id); //获取某个实例的属性集
      setPoint(viewer, attributes.boundingSphere.center);
      viewer.camera.flyToBoundingSphere(attributes.boundingSphere, {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(0.0),
          Cesium.Math.toRadians(-80.0),
          5000000,
        ),
      });
      attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(
        Cesium.Color.fromRandom({
          alpha: 1.0,
        }),
      );
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };

  const setPoint = (viewer: Cesium.Viewer, position: Cesium.Cartesian3) => {
    viewer.entities.add({
      position: position,
      point: {
        color: Cesium.Color.BLUE,
        pixelSize: 10,
        outlineColor: Cesium.Color.RED,
        outlineWidth: 2
      },
    });
  };

  return <div className={styles.container} ref={cesiums}></div>;
}
