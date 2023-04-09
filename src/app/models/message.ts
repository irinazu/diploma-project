import {ImageModel} from "./image-model";

export class Message {
  constructor(content: string, user_system_id: number, chat_id: number) {
    this.content = content;
    this.user_system_id = user_system_id;
    this.chat_id = chat_id;
  }

  id:number=0;
  content:string="";
  date:string="";
  user_system_id:number=0;
  chat_id:number=0;
  formData: FormData = new FormData();
  listImgInNumber:number[]=[];

}
