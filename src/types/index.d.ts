// This file defines the types and interfaces used in the project.

declare namespace Image {
  interface Info {
    fileName: string;
    fileExt: string;
    fullName: string;
    dimensions?: {
      width: number;
      height: number;
    };
    fileSize: number;
    camera: {
      make: string;
      model: string;
      lens: string;
    };
    exposure: {
      exposureTime: number;
      fNumber: number;
      iso: number;
      focalLength: number;
    };
    dateTime: string; // 或使用 Date 类型
    gps: null | {
      latitude: number;
      longitude: number;
      altitude?: number;
    };
    location: Record<string, never>; // 或更具体的定位类型
    colors: string[]; // 或 Array<{ hex: string; percentage: number }> 等
    metadata: {
      orientation: number;
      format: string;
    };
    featured?: boolean;
  }

  interface CompressionResult {
    minImagePath: string;
    midImagePath: string;
  }

  interface AppState {
    currentMode: 'waterfall' | 'ppt';
    isDarkMode: boolean;
  }
}