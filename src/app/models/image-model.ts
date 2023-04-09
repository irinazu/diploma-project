import {SafeUrl} from "@angular/platform-browser";

export class ImageModel {
  id:number|undefined;

  file: File | undefined;
  url: SafeUrl | undefined;
  picBytes: ArrayBuffer | undefined
}
