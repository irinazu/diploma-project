import {Message} from "./message";
import {ImageModel} from "./image-model";

export class Chat {
  id:number=0;
  title:string="";
  message:Message=new Message("",0,0);
  imageOfChat:ImageModel=new ImageModel();
}
