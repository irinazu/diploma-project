import { Component, OnInit } from '@angular/core';
import {ChatService} from "../services/chat.service";
import {Chat} from "../models/chat";
import {Message} from "../models/message";
import * as io from "socket.io-client";
import {map, mergeMap} from "rxjs";
import {ImageModel} from "../models/image-model";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-all-chat',
  templateUrl: './all-chat.component.html',
  styleUrls: ['./all-chat.component.css']
})
export class AllChatComponent implements OnInit {

  constructor(private serviceChat:ChatService, private sanitizer:DomSanitizer) { }
  chats:Chat[]=[];
  lastMessages:Message[]=[];
  mess:Message|undefined;
  message:Message[]=[];
  newMessages:Message[]=[];
  newMessage:string="";

  ngOnInit(): void {
    //находим все чаты принадлежащте одному пользователю и + полследнее сообщение чата
    this.serviceChat.getAllChatForUser(1).subscribe(value => {
      this.chats=value;
      for (let i = 0; i < this.chats.length; i++) {

        if (this.chats[i].imageOfChat != null) {
          this.chats[i].imageOfChat = this.createFImg(this.chats[i].imageOfChat)
        }
      }

      for(let i=0;i<value.length;i++){
        this.serviceChat.getLastMessageForChat(this.chats[i].id).subscribe(mes=>{
          this.chats[i].message=mes[0];
        })
      }
    });
  }
  checkImgForChat(chat:Chat){
    return chat.imageOfChat!=null;
  }
  createFImg(imany:ImageModel):ImageModel{
    const image:any=imany;
    const blob=this.dataURItoBlob(image.picBytes);
    const imgFile=new File([blob],"a",{type:"image/png"});
    const finaleFileHandle:ImageModel={
      id:imany.id,
      picBytes:imany.picBytes,
      file:imgFile,
      url:this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(imgFile))
    };
    return finaleFileHandle;
  }
  dataURItoBlob(picBytes:any){
    const byteString=window.atob(picBytes);
    const arrayBuffer=new ArrayBuffer(byteString.length);
    const inst8Array=new Uint8Array(arrayBuffer);
    for(let i=0;i<byteString.length;i++){
      inst8Array[i]=byteString.charCodeAt(i);
    }
    const blob=new Blob([inst8Array],{type:"image/png"});
    return blob;
  }

  getLetter(chat: Chat) {
    return chat.title.charAt(0).toLocaleUpperCase()
  }
}
