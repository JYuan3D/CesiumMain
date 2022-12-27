import { useEffect, useRef } from 'react';
import styles from './index.less';

// ======================================================================
//  线性代数和辅助工具
// ======================================================================

// 两个三维向量的点积
const DotProduct = (v1: number[], v2: number[]) => {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

// 3D向量的长度.
const Length = (vec: number[]) => {
  return Math.sqrt(DotProduct(vec, vec));
};

// 计算 k * vec.
const Multiply = (k: number, vec: number[]) => {
  return [k * vec[0], k * vec[1], k * vec[2]];
};

// 计算 v1 + v2.
const Add = (v1: number[], v2: number[]) => {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
};

// 计算 v1 - v2.
const Subtract = (v1: number[], v2: number[]) => {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

// 将颜色夹到标准颜色范围
const Clamp = (vec: number[]) => {
  return [
    Math.min(255, Math.max(0, vec[0])),
    Math.min(255, Math.max(0, vec[1])),
    Math.min(255, Math.max(0, vec[2])),
  ];
};

// 一个球体
class Sphere {
  center: number[];
  radius: number;
  color: number[];

  constructor(center: number[], radius: number, color: number[]) {
    this.center = center;
    this.radius = radius;
    this.color = color;
  }
}

// 一个光源
class Light {
  ltype: number;
  intensity: number;
  position?: number[];

  static AMBIENT = 0;
  static POINT = 1;
  static DIRECTIONAL = 2;

  constructor(ltype: number, intensity: number, position?: number[]) {
    this.ltype = ltype;
    this.intensity = intensity;
    this.position = position;
  }
}

export default function Map(props: any) {
  const canvasRef = useRef<any>();

  const viewport_size = 1;
  const projection_plane_z = 1;
  const camera_position = [0, 0, 0];
  const background_color = [255, 255, 255];
  const spheres = [
    new Sphere([0, -1, 3], 1, [255, 0, 0]),
    new Sphere([2, 0, 4], 1, [0, 0, 255]),
    new Sphere([-2, 0, 4], 1, [0, 255, 0]),
    new Sphere([0, -5001, 0], 5000, [255, 255, 0]),
  ];

  const lights = [
    new Light(Light.AMBIENT, 0.2),
    new Light(Light.POINT, 0.6, [2, 1, 0]),
    new Light(Light.DIRECTIONAL, 0.2, [1, 4, 4]),
  ];

  useEffect(() => {
    let canvas: HTMLCanvasElement = canvasRef.current;
    let canvas_context = canvas.getContext('2d');
    let canvas_buffer = canvas_context!.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    let canvas_pitch = canvas_buffer.width * 4;

    // 主循环
    for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
      for (let y = -canvas.height / 2; y < canvas.height / 2; y++) {
        let direction = CanvasToViewport(canvas, [x, y]);
        let color = TraceRay(camera_position, direction, 1, Infinity);
        PutPixel(canvas, canvas_buffer, canvas_pitch, x, y, Clamp(color));
      }
    }

    UpdateCanvas(canvas_context!, canvas_buffer);
  }, []);

  // 将2D画布坐标转换为3D视口坐标
  const CanvasToViewport = (canvas: HTMLCanvasElement, p2d: number[]) => {
    return [
      (p2d[0] * viewport_size) / canvas.width, // [-1/2, +1/2]
      (p2d[1] * viewport_size) / canvas.height, // [-1/2, +1/2]
      projection_plane_z,
    ];
  };

  const TraceRay = (
    origin: number[],
    direction: number[],
    min_t: number,
    max_t: number,
  ) => {
    let closest_t = Infinity;
    let closest_sphere = null;

    for (let i = 0; i < spheres.length; i++) {
      let ts = IntersectRaySphere(origin, direction, spheres[i]);
      if (ts[0] < closest_t && min_t < ts[0] && ts[0] < max_t) {
        closest_t = ts[0];
        closest_sphere = spheres[i];
      }
      if (ts[1] < closest_t && min_t < ts[1] && ts[1] < max_t) {
        closest_t = ts[1];
        closest_sphere = spheres[i];
      }
      // 使用ts数组中最小的值
    }

    if (closest_sphere == null) {
      return background_color;
    }

    let point = Add(origin, Multiply(closest_t, direction)); // 找到表面上的点
    let normal = Subtract(point, closest_sphere.center); // 计算出法线
    // 为了将这个向量归一化（normalize）并将其转化成真正的法线，我们需要将它除以它自己的长度，从而保证结果的长度为1
    normal = Multiply(1.0 / Length(normal), normal);

    return Multiply(ComputeLighting(point, normal), closest_sphere.color);
  };

  const IntersectRaySphere = (
    origin: number[],
    direction: number[],
    sphere: any,
  ) => {
    let oc = Subtract(origin, sphere.center);

    let k1 = DotProduct(direction, direction);
    let k2 = 2 * DotProduct(oc, direction);
    let k3 = DotProduct(oc, oc) - sphere.radius * sphere.radius;

    let discriminant = k2 * k2 - 4 * k1 * k3;
    if (discriminant < 0) {
      return [Infinity, Infinity];
    }

    let t1 = (-k2 + Math.sqrt(discriminant)) / (2 * k1);
    let t2 = (-k2 - Math.sqrt(discriminant)) / (2 * k1);
    return [t1, t2];
  };

  // 计算漫反射光照的函数
  const ComputeLighting = (point: number[], normal: number[]) => {
    let intensity = 0;
    let length_n = Length(normal); // Should be 1.0, but just in case...

    // 累计多个光源效果
    for (let i = 0; i < lights.length; i++) {
      let light = lights[i];
      if (light.ltype == Light.AMBIENT) {
        intensity += light.intensity;
      } else {
        let vec_l;
        if (light.ltype == Light.POINT) {
          vec_l = Subtract(light.position!, point);
        } else {
          // Light.DIRECTIONAL
          vec_l = light.position;
        }

        let n_dot_l = DotProduct(normal, vec_l!);
        if (n_dot_l > 0) {
          intensity +=
            (light.intensity * n_dot_l) / (length_n * Length(vec_l!));
        }
      }
    }

    return intensity;
  };

  // 绘制像素
  const PutPixel = (
    canvas: HTMLCanvasElement,
    canvas_buffer: ImageData,
    canvas_pitch: number,
    x: number,
    y: number,
    color: number[],
  ) => {
    x = canvas.width / 2 + x;
    y = canvas.height / 2 - y - 1;

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return;
    }

    let offset = 4 * x + canvas_pitch * y;
    canvas_buffer.data[offset++] = color[0];
    canvas_buffer.data[offset++] = color[1];
    canvas_buffer.data[offset++] = color[2];
    canvas_buffer.data[offset++] = 255;
  };

  // 将屏幕外缓冲区的内容显示到画布中
  const UpdateCanvas = (
    canvas_context: CanvasRenderingContext2D,
    canvas_buffer: ImageData,
  ) => {
    canvas_context.putImageData(canvas_buffer, 0, 0);
  };

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width="600"
        height="600"
        style={{ border: '1px rgb(236, 223, 31) solid' }}
      ></canvas>
    </div>
  );
}
