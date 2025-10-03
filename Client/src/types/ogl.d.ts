declare module 'ogl' {
  export interface RendererOptions {
    [key: string]: any;
  }
  
  export interface ProgramOptions {
    [key: string]: any;
  }
  
  export interface MeshOptions {
    [key: string]: any;
  }
  
  // Declare classes properly so they can be used as both values and types
  export declare class Renderer {
    constructor(options?: RendererOptions);
    [key: string]: any;
  }
  
  export declare class Program {
    constructor(gl: any, options?: ProgramOptions);
    [key: string]: any;
  }
  
  export declare class Triangle {
    constructor(gl?: any, options?: any);
    [key: string]: any;
  }
  
  export declare class Mesh {
    constructor(gl: any, options?: MeshOptions);
    [key: string]: any;
  }
  
  export declare class Camera {
    constructor(options?: any);
    [key: string]: any;
  }
  
  export declare class Transform {
    constructor();
    [key: string]: any;
  }
}
