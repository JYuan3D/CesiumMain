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

const ReflectRay = (v1: number[], v2: number[]) => {
  return Subtract(Multiply(2 * DotProduct(v1, v2), v2), v1);
};

// 一个球体
class Sphere {
  center: number[];
  radius: number;
  color: number[];
  specular: number;
  reflective: number;

  constructor(
    center: number[],
    radius: number,
    color: number[],
    specular: number,
    reflective: number,
  ) {
    this.center = center;
    this.radius = radius;
    this.color = color;
    this.specular = specular;
    this.reflective = reflective;
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
  const background_color = [0, 0, 0];
  const spheres = [
    new Sphere([0, -1, 3], 1, [255, 0, 0], 500, 0.2),
    new Sphere([-2, 0, 4], 1, [0, 255, 0], 10, 0.4),
    new Sphere([2, 0, 4], 1, [0, 0, 255], 500, 0.3),
    new Sphere([0, -5001, 0], 5000, [255, 255, 0], 1000, 0.5),
  ];

  const lights = [
    new Light(Light.AMBIENT, 0.2),
    new Light(Light.POINT, 0.6, [2, 1, 0]),
    new Light(Light.DIRECTIONAL, 0.2, [1, 4, 4]),
  ];

  let EPSILON = 0.001;
  let recursion_depth = 3;

  useEffect(() => {
    let canvas: HTMLCanvasElement = canvasRef.current;
    Render(canvas);
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
    depth: number,
  ): number[] => {
    let intersection = ClosestIntersection(origin, direction, min_t, max_t);
    if (!intersection) {
      return background_color;
    }

    let closest_sphere = intersection[0];
    let closest_t = intersection[1];

    let point = Add(origin, Multiply(closest_t, direction));
    let normal = Subtract(point, closest_sphere.center);
    normal = Multiply(1.0 / Length(normal), normal);

    let view = Multiply(-1, direction);
    let lighting = ComputeLighting(
      point,
      normal,
      view,
      closest_sphere.specular,
    );
    let local_color = Multiply(lighting, closest_sphere.color);

    if (closest_sphere.reflective <= 0 || depth <= 0) {
      return local_color;
    }

    let reflected_ray = ReflectRay(view, normal);
    let reflected_color = TraceRay(
      point,
      reflected_ray,
      EPSILON,
      Infinity,
      depth - 1,
    );

    return Add(
      Multiply(1 - closest_sphere.reflective, local_color),
      Multiply(closest_sphere.reflective, reflected_color),
    );
  };

  const ClosestIntersection = (
    origin: number[],
    direction: number[],
    min_t: number,
    max_t: number,
  ): [Sphere, number] | null => {
    let closest_t: number = Infinity;
    let closest_sphere: Sphere | null = null;

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
    }

    if (closest_sphere) {
      return [closest_sphere, closest_t];
    }
    return null;
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

  const ComputeLighting = (
    point: number[],
    normal: number[],
    view: number[],
    specular: number,
  ) => {
    let intensity = 0;
    let length_n = Length(normal); // Should be 1.0, but just in case...
    let length_v = Length(view);

    for (let i = 0; i < lights.length; i++) {
      let light = lights[i];
      if (light.ltype == Light.AMBIENT) {
        intensity += light.intensity;
      } else {
        let vec_l, t_max;
        if (light.ltype == Light.POINT) {
          vec_l = Subtract(light.position!, point);
          t_max = 1.0;
        } else {
          // Light.DIRECTIONAL
          vec_l = light.position;
          t_max = Infinity;
        }

        // Shadow check.
        let blocker = ClosestIntersection(point, vec_l!, EPSILON, t_max);
        if (blocker) {
          continue;
        }

        // Diffuse reflection.
        let n_dot_l = DotProduct(normal, vec_l!);
        if (n_dot_l > 0) {
          intensity +=
            (light.intensity * n_dot_l) / (length_n * Length(vec_l!));
        }

        // Specular reflection.
        if (specular != -1) {
          let vec_r = ReflectRay(vec_l!, normal);
          let r_dot_v = DotProduct(vec_r, view);
          if (r_dot_v > 0) {
            intensity +=
              light.intensity *
              Math.pow(r_dot_v / (Length(vec_r) * length_v), specular);
          }
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

  const SetShadowEpsilon = (canvas: HTMLCanvasElement, epsilon: number) => {
    console.warn('[反射指数]:', epsilon);
    EPSILON = epsilon;
    Render(canvas);
  };

  const SetRecursionDepth = (canvas: HTMLCanvasElement, depth: number) => {
    console.warn('[递归深度]:', depth);
    recursion_depth = depth;
    Render(canvas);
  };

  const ClearAll = (canvas: HTMLCanvasElement) => {
    canvas.width = canvas.width;
  };

  const Render = (canvas: HTMLCanvasElement) => {
    ClearAll(canvas);

    // This lets the browser clear the canvas before blocking to render the scene.
    setTimeout(function () {
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
          let color = TraceRay(
            camera_position,
            direction,
            1,
            Infinity,
            recursion_depth,
          );
          PutPixel(canvas, canvas_buffer, canvas_pitch, x, y, Clamp(color));
        }
      }

      UpdateCanvas(canvas_context!, canvas_buffer);
    }, 0);
  };

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width="600"
        height="600"
        style={{ border: '1px grey solid' }}
      ></canvas>
      <div style={{ display: 'block' }}>
        <button onClick={() => SetShadowEpsilon(canvasRef.current, 0)}>
          Zero
        </button>
        <button onClick={() => SetShadowEpsilon(canvasRef.current, 0.001)}>
          Epsilon
        </button>
        <button onClick={() => SetRecursionDepth(canvasRef.current, 0)}>
          depth x0
        </button>
        <button onClick={() => SetRecursionDepth(canvasRef.current, 1)}>
          depth x1
        </button>
        <button onClick={() => SetRecursionDepth(canvasRef.current, 2)}>
          depth x2
        </button>
        <button onClick={() => SetRecursionDepth(canvasRef.current, 3)}>
          depth x3
        </button>
        <button onClick={() => SetRecursionDepth(canvasRef.current, 4)}>
          depth x4
        </button>
        <button onClick={() => SetRecursionDepth(canvasRef.current, 5)}>
          depth x5
        </button>
        <button onClick={() => SetRecursionDepth(canvasRef.current, 50)}>
          depth x50
        </button>
      </div>
    </div>
  );
}
