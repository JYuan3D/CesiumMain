import { Cesium } from '@sl-theia/vis';
import { Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
// import { drawRectangle } from './Draw/surface';
import styles from './index.less';

const options = [
  {
    label: 'Aircraft',
    value: './cesium/models/CesiumAir/Cesium_Air.glb',
    height: 5000.0,
  },
  {
    label: 'Drone',
    value: './cesium/models/CesiumDrone/CesiumDrone.glb',
    height: 150.0,
  },
  {
    label: 'Ground Vehicle',
    value: './cesium/models/GroundVehicle/GroundVehicle.glb',
    height: 0,
  },
  {
    label: 'Hot Air Balloon',
    value: './cesium/models/CesiumBalloon/CesiumBalloon.glb',
    height: 1000.0,
  },
  {
    label: 'Milk Truck',
    value: './cesium/models/CesiumMilkTruck/CesiumMilkTruck.glb',
    height: 0,
  },
  {
    label: 'Skinned Character',
    value: './cesium/models/CesiumMan/Cesium_Man.glb',
    height: 0,
  },
  {
    label: 'Unlit Box',
    value: './cesium/models/BoxUnlit/BoxUnlit.gltf',
    height: 10.0,
  },
  {
    label: 'Draco Compressed Model',
    value: './cesium/models/DracoCompressed/CesiumMilkTruck.gltf',
    height: 0,
  },
  {
    label: 'KTX2 Compressed Balloon',
    value: './cesium/models/CesiumBalloonKTX2/CesiumBalloonKTX2.glb',
    height: 1000,
  },
  {
    label: 'Instanced Box',
    value: './cesium/models/BoxInstanced/BoxInstanced.gltf',
    height: 15,
  },
  {
    label: 'SM_FBJD_Boy1',
    value: './static/model/npc/SM_FBJD_Boy1.glb',
    height: 0,
  },
  {
    label: 'SM_FBJD_Boy2',
    value: './static/model/npc/SM_FBJD_Boy2.glb',
    height: 0,
  },
  {
    label: 'SM_XMH_EM_WRJ_01',
    value: './static/model/npc/SM_XMH_EM_WRJ_01.FBX',
    height: 0,
  },
];

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

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
        shouldAnimate: true,
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        fullscreenButton: false,
      });
      viewerRef.current = viewer;
      setIsLoadedViewer(true);
    }
  }, []);

  const handleChange = (viewer: Cesium.Viewer, value: string) => {
    let option = options.find((option) => option.value === value);
    if (!Cesium.FeatureDetection.supportsBasis(viewer.scene)) {
      window.alert(
        'This browser does not support Basis Universal compressed textures',
      );
    } else {
      if (option?.value && !isNaN(option?.height)) {
        createModel(viewer, option?.value, option?.height);
      }
    }
  };

  const createModel = (
    viewer: Cesium.Viewer,
    url: string,
    height: number,
  ): void => {
    viewer.entities.removeAll();
    const position = Cesium.Cartesian3.fromDegrees(
      -123.0744619,
      44.0503706,
      height,
    );
    const heading = Cesium.Math.toRadians(135);
    const pitch = 0;
    const roll = 0;
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr,
    );
    const model = new Cesium.ModelGraphics({
      uri: url,
      minimumPixelSize: 128,
      maximumScale: 20000,
      runAnimations: true,
      clampAnimations: true,
      colorBlendAmount: 1.0
    });

    const entity = viewer.entities.add({
      name: url,
      position: position,
      orientation: orientation,
      model: model,
    });
    viewer.trackedEntity = entity;
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <Select
          defaultValue="请选择"
          style={{ width: 200 }}
          onChange={(v) => handleChange(viewerRef.current, v)}
          options={options}
        />
      </div>
    </>
  );
}
