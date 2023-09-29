import { Application } from './types';

export function bytesToImgSrc(application: Application): string {
  const base64String = btoa(
    String.fromCharCode(
      ...new Uint8Array(application.parameters.icons[0].image.data)
    )
  );
  return 'data:image/png;base64,' + base64String;
}
