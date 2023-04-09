import {UserSystem} from "./user-system";
import {ImageModel} from "./image-model";

export class MessageAndUser {
  id:number=0;
  content:string="";
  date:string="";
  user_system_id:number=0;
  chat_id:number=0;
  name:string="";
  user_system_object:UserSystem=new UserSystem();
  imageModelsForMessage:ImageModel[]=[];

  listImgInNumber:number[]=[];

}
