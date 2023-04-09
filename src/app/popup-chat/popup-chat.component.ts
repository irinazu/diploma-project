import {Component, Inject, OnInit} from '@angular/core';
import {UserSystem} from "../models/user-system";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ImageModel} from "../models/image-model";
import {ChatService} from "../services/chat.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-popup-chat',
  templateUrl: './popup-chat.component.html',
  styleUrls: ['./popup-chat.component.css']
})
export class PopupChatComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data:any,private chatServer:ChatService,
              private sanitizer:DomSanitizer,public dialogRef: MatDialogRef<PopupChatComponent>) { }
  users:UserSystem[]=[];
  imageOfChat:ImageModel=new ImageModel();
  title:string="";
  idOfChat:number=0;

  formData: FormData = new FormData();
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  previews: string[] = [];

  ngOnInit(): void {
    this.users=this.data.users;
    this.title=this.data.title;
    this.imageOfChat=this.data.imageOfChat;
    this.idOfChat=this.data.idOfChat;
  }
  checkImgForUser(mem: UserSystem) {
    return mem.imgAvatar!=null;
  }
  checkImgForChat(){
    return this.imageOfChat.url!=null;
  }

  //смена фотографии чата
  selectFiles(event: any): void {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    this.previews = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
        };
        reader.readAsDataURL(this.selectedFiles[i]);
      }
    }
  }
  uploadFiles(): void {
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.formData.append("imgFile",this.selectedFiles[i]);
      }
      this.chatServer.loadChatImgOnServer(this.idOfChat,this.formData).subscribe(value => {
        this.imageOfChat=value;
        this.imageOfChat=this.createFImg(this.imageOfChat);
        this.disUploadFiles();

        this.dialogRef.close(this.imageOfChat);

      });
    }
  }

  //Обработка картинок
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

  disUploadFiles() {
    this.formData.delete("imgFile");
    this.selectedFiles=undefined;
    this.progressInfos.length=0;
    this.previews.length=0;
    // @ts-ignore
    document.querySelector('input[type=file]').value = '';
  }
}
