export type Application = {
  identifier: string;
  name: string;
  parameters: {
    icons: {
      format: 'png';
      width?: number;
      height?: number;
      image: {
        data: Buffer;
      };
    }[];
    version: string;
  };
};
