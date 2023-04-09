import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ChatService} from "../services/chat.service";
import {MessageAndUser} from "../models/message-and-user";
import * as io from "socket.io-client";
import {Message} from "../models/message";
import {MatDialog} from "@angular/material/dialog";
import {PopupChatComponent} from "../popup-chat/popup-chat.component";
import {UserSystem} from "../models/user-system";
import {PopupDeleteConfirmComponent} from "../popup-delete-confirm/popup-delete-confirm.component";
import {ImageModel} from "../models/image-model";
import {DomSanitizer} from "@angular/platform-browser";
import {Chat} from "../models/chat";
import {PopupMaxSizeComponent} from "../popup-max-size/popup-max-size.component";

@Component({
  selector: 'app-certain-chat',
  templateUrl: './certain-chat.component.html',
  styleUrls: ['./certain-chat.component.css']
})
export class CertainChatComponent implements OnInit /*, OnDestroy*/ {
  @ViewChild('scrollPoint') private my_point_3: ElementRef | undefined;
  @ViewChild('resultsStart', {read: ElementRef}) resultsStart: ElementRef | undefined;
  @ViewChild('hide', {read: ElementRef}) hide: ElementRef | undefined;
  @ViewChild('bl', {read: ElementRef}) bl: ElementRef | undefined;

  constructor(private router: ActivatedRoute,
              private serviceChat: ChatService,
              private matDialog:MatDialog,
              private sanitizer:DomSanitizer) {
  }
  //ЭТО ТОЖЕ РАБОЧИЙ ВАРИАНТ
  /*@HostListener('window:beforeunload')
  async ngOnDestroy() {
    await this.serviceChat.test("HUUUUUUUUUUUUUUUUUUUUUUUU").subscribe();
  }*/

  //ЭТО РАБОЧИЙ ВАРИАНТ
  @HostListener('window:beforeunload', ['$event'])
  doSomething(event:any) {
    this.serviceChat.userCloseChat(this.router.snapshot.params['id']).subscribe();
  }

  messages: MessageAndUser[] = [];
  userNameNow: string = "user1";
  title: string = "";
  elementPointed: any[] = [];
  months = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сент', 'нояб', 'дек',
  ];
  socket: any;
  nameForSending: string = "";
  indexForUpdatindMessage: number = -1;
  messageForDelete: number[] = [];
  messageForDeleteInClassMessage: MessageAndUser[] = [];
  usersForChat:UserSystem[]=[];
  imageOfChat:ImageModel=new ImageModel();

  //load photo for new message
  formData: FormData = new FormData();
  selectedFiles?: File[];
  previews: string[] = [];
  separateFileForSend:File[]=[];
  editMessagePreviews:ImageModel[]=[];
  imgForEditMessage:number[]=[];

  //для установления лимита загрузки картинок
  generalSizeOfImg:number=0;
  limit:number=10;

  //Показывать корзину или нет
  showTrashCan:boolean=true;

  ngOnInit(): void {
    // @ts-ignore
    //this.nameForSending=prompt();

    //Аватарка для чата
    this.serviceChat.getChatImg(this.router.snapshot.params['id']).subscribe(value => {
      if(value!=null){
        this.imageOfChat=this.createFImg(value);
      }
    })

    //Собираем всех пользователей чата
    this.serviceChat.getAllUserForChat(this.router.snapshot.params['id']).subscribe(value => {
      this.usersForChat = value;
      for (let i = 0; i < this.usersForChat.length; i++) {
        if (this.usersForChat[i].imgAvatar != null) {
          this.usersForChat[i].imgAvatar = this.createFImg(this.usersForChat[i].imgAvatar)
        }
      }

      this.serviceChat.getAllMessageForChat(this.router.snapshot.params['id']).subscribe(value => {
        this.messages = value;
        for(let i=0;i<this.messages.length;i++){
          this.setImgForUser(i);
        }
        this.messages.sort(function (a, b) {
          return a.id - b.id;
        });
        for(let i=0;i<this.messages.length;i++) {
          if (this.messages[i].imageModelsForMessage){
            for (let j = 0; j < this.messages[i].imageModelsForMessage.length; j++) {
              this.messages[i].imageModelsForMessage[j] = this.createFImg(this.messages[i].imageModelsForMessage[j])
            }
          }
        }
        //Первое непрочитанное сообщение
        this.serviceChat.getDateForUserInChat(this.router.snapshot.params['id']).subscribe(date=>{
          let serviceDate=new Date(date);
          let dateExist=false;
          for(let i=0;i<this.messages.length;i++){
            let messageDate=new Date(this.messages[i].date);
            if(serviceDate.getTime()<messageDate.getTime()){
              dateExist=true;
              this.messagesDown(500,i);
              return;
            }
          }
          if(!dateExist){this.messagesDown(500,-1);}
        })

      })
    })

    this.title = this.router.snapshot.params['title'];
    this.openCertainChat(this.router.snapshot.params['id']);
  }

  setImgForUser(messageIdForCheckImg:number){
    // @ts-ignore
    this.messages[messageIdForCheckImg].user_system_object=this.usersForChat.find(x=>x.name===this.messages[messageIdForCheckImg].name);
  }

  //показываем дату, сверяясь с прошлым сообщением
  showDate(i: number) {
    let date1, date2;
    if (i != 0) {
      date1 = new Date(this.messages[i].date).getDate();
      date2 = new Date(this.messages[--i].date).getDate();
    }
    if (i === 0) return true;
    else if (date1 !== date2) {
      return true;
    } else {
      return false;
    }
  }

  thisUser(name: string) {
    return name == this.nameForSending;
  }

  returnDate(date: string) {
    let day = new Date(date).getDate();
    let month = this.months[new Date(date).getMonth()];
    return day + " " + month;
  }

  //SOCKETS подписки на emit
  openCertainChat(id: number) {
    this.socket = io.io("http://localhost:3000", {transports: ["websocket", "polling", "flashsocket"]});
    this.socket.emit("joinToRoom", id);

    //Добавляет новопришедшие сообщения
    this.socket.on("takeNewMessage", (newMessagInDoc: MessageAndUser) => {
      for(let i=0;i<newMessagInDoc.imageModelsForMessage.length;i++){
        newMessagInDoc.imageModelsForMessage[i]=this.createFImg(newMessagInDoc.imageModelsForMessage[i]);
      }
      this.messages.push(newMessagInDoc);
      this.setImgForUser(this.messages.length-1)
      this.messagesDown(100,-1);
    })

    //Обновляет сообщения от других пользователей
    this.socket.on("takeUpdateMessage", (newMessagInDoc: MessageAndUser) => {
      let elem = this.messages.find(x => x.id == newMessagInDoc.id);
      elem!.content = newMessagInDoc.content;
      for(let i=0;i<newMessagInDoc.imageModelsForMessage.length;i++){
        newMessagInDoc.imageModelsForMessage[i]=this.createFImg(newMessagInDoc.imageModelsForMessage[i]);
      }
      for(let i=0;i<newMessagInDoc.listImgInNumber.length;i++){
        let imageModel=elem!.imageModelsForMessage.find(x=>x.id===newMessagInDoc.listImgInNumber[i]);
        let imgModelForDelete=elem!.imageModelsForMessage.indexOf(imageModel!);
        elem!.imageModelsForMessage.splice(imgModelForDelete,1)
      }
      elem!.imageModelsForMessage.push(...newMessagInDoc.imageModelsForMessage);
    })

    //Удаляет сообщения от других пользователей
    this.socket.on("takeDeleteMessage", (arrayForSendForDeleteMessage: number[]) => {
      for (let i = 0; i < arrayForSendForDeleteMessage.length; i++) {
        let index = this.messages.findIndex(x => x.id == arrayForSendForDeleteMessage[i])
        this.messages.splice(index, 1);
      }
    })

    //Обновляет картинку чата от других пользователей
    this.socket.on("takeNewImgOfChat",(imgOfChat:ImageModel)=>{
      this.imageOfChat=imgOfChat;
    })
  }

  //опускаем до нижнего сообщения
  messagesDown(time: number,i:number) {
    if(i!=-1){
      setTimeout(() => {
        // @ts-ignore
        document.getElementsByClassName('certainChatMessage')[i].scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, time)

      document.getElementsByClassName('certainChatMessage')[i].setAttribute('style',"transition: 0.3s")
      document.getElementsByClassName('certainChatMessage')[i].setAttribute('style',"background-color:rgb(61 144 206 / 18%)")

      setTimeout(() => {
        document.getElementsByClassName('certainChatMessage')[i].setAttribute('style',"background-color:")

      }, 5000)

    }else {
      setTimeout(() => {
        // @ts-ignore
        this.resultsStart.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, time)
    }
  }

  //выделение полосой выбранного сообщения
  actionWithMessage($event: any, id: number) {

    let clickMessage = $event.target;
    if (clickMessage.className != "editButton") {
      let showTrashCanAllOverTheArray=true;
      if (this.elementPointed.length == 0) {
        this.elementPointed.push(clickMessage);
        clickMessage.setAttribute('style', "background-color:rgb(61 144 206 / 18%)");
        this.messageForDelete.push(id);
      } else if (this.elementPointed.indexOf(clickMessage) > -1) {
        clickMessage.setAttribute('style', "background-color:transparent");
        this.elementPointed.splice(this.elementPointed.indexOf(clickMessage), 1);
        this.messageForDelete.splice(this.messageForDelete.indexOf(id), 1);
      } else {
        clickMessage.setAttribute('style', "background-color:rgb(61 144 206 / 18%)");
        this.elementPointed.push(clickMessage);
        this.messageForDelete.push(id);
      }
      this.showHiddenBlock()

      //показываем кнопку удаления или нет
      for(let i=0;i<this.messageForDelete.length;i++){
        if(!this.showEditButtonFunction(this.messages[this.messageForDelete[i]].date)){
          this.showTrashCan=false;
          showTrashCanAllOverTheArray=false;
          return;
        }
      }
      if(showTrashCanAllOverTheArray){
        this.showTrashCan=true;
      }
      //------------------------------------

    }
  }

  //показываем верхний блок или нет
  showHiddenBlock() {
    if (this.elementPointed.length == 0) {
      // @ts-ignore
      this.bl?.nativeElement.setAttribute('style', "display:flex");
      // @ts-ignore
      this.hide?.nativeElement.setAttribute('style', "display:none");
    } else {
      // @ts-ignore
      this.hide?.nativeElement.setAttribute('style', "display:flex");
      // @ts-ignore
      this.bl?.nativeElement.setAttribute('style', "display:none");
    }
  }

  editMessage(i: number) {
    document.getElementById("cancelUpdateMessage")!.setAttribute('style',"display:block");
    (<HTMLInputElement>document.getElementById("newMessage")).value = this.messages[i].content;
    this.editMessagePreviews=[...this.messages[i].imageModelsForMessage];
    this.indexForUpdatindMessage = i;
    document.getElementById("newMessageIcon")!.setAttribute('style', "display:none")
    document.getElementById("editMessageConfirm")!.setAttribute('style', "display:block")
  }

  confirmUpdateMessage() {
    // @ts-ignore
    this.messages[this.indexForUpdatindMessage].content = document.getElementById("newMessage").value;
    let idForUpdating=this.messages[this.indexForUpdatindMessage].id;
    const messageUpdater = {
      content: this.messages[this.indexForUpdatindMessage].content,
      listImgInNumber: this.imgForEditMessage
    }
    let newMessagInDoc = new MessageAndUser();
    newMessagInDoc.id=idForUpdating;
    newMessagInDoc.content=messageUpdater.content;
    newMessagInDoc.listImgInNumber=this.imgForEditMessage;

    this.serviceChat.updateMessage(idForUpdating,messageUpdater).subscribe(value => {

      if(this.separateFileForSend.length!=0){
        for (let i = 0; i < this.separateFileForSend.length; i++) {
          this.formData.append("imgFile",this.separateFileForSend[i]);
        }
        this.serviceChat.loadPhotoForMessage(idForUpdating,this.formData).subscribe(images => {
          newMessagInDoc.imageModelsForMessage=images;
          for(let i=0;i<newMessagInDoc.imageModelsForMessage.length;i++){
            newMessagInDoc.imageModelsForMessage[i]=this.createFImg(newMessagInDoc.imageModelsForMessage[i]);
          }
          this.messages[this.indexForUpdatindMessage].imageModelsForMessage.push(...newMessagInDoc.imageModelsForMessage);
          console.log(newMessagInDoc)
          this.socket.emit("updateMessage",newMessagInDoc)
        })
        setTimeout(() => {
          this.formData.delete("imgFile");
          this.previews=[];
          this.separateFileForSend=[];
          // @ts-ignore
          (<HTMLInputElement>document.getElementById("newMessage")).value = "";
        }, 500)
      }
    });

    for(let i=0;i<this.imgForEditMessage.length;i++){
      let messageForDelete=this.messages[this.indexForUpdatindMessage].imageModelsForMessage.find(x=>x.id===this.imgForEditMessage[i]);
      let imgModelForDelete=this.messages[this.indexForUpdatindMessage].imageModelsForMessage.indexOf(messageForDelete!);
      this.messages[this.indexForUpdatindMessage].imageModelsForMessage.splice(imgModelForDelete,1)
      //this.socket.emit("updateMessage",newMessagInDoc)
    }
    //this.indexForUpdatindMessage = -1;
    this.imgForEditMessage=[];
    this.editMessagePreviews=[];
    // @ts-ignore
    document.getElementById("newMessage").value = "";
    // @ts-ignore
    document.getElementById("editMessageConfirm").setAttribute('style', "display:none")
    // @ts-ignore
    document.getElementById("newMessageIcon").setAttribute('style', "display:block")

  }

  cancelActions() {
    for (let i = 0; i < this.elementPointed.length; i++) {
      this.elementPointed[i].setAttribute('style', "background-color:transparent");
    }
    this.elementPointed.length = 0;
    this.messageForDelete=[];
    this.showHiddenBlock();
  }

  //удаление сообщений за 24 часа
  deleteMessageConfirm(){
    let deleteConfirm=this.matDialog.open(PopupDeleteConfirmComponent,{width:"40%"})
    deleteConfirm.afterClosed().subscribe(value => {
      //если получено подтверждение на удаление
      if(value){
        let arrayForSendForDeleteMessage=[];
        for (let i = 0; i < this.messageForDelete.length; i++) {
          arrayForSendForDeleteMessage.push(this.messages[this.messageForDelete[i]].id);
        }
        //отправляем серверу на удаление
        this.serviceChat.deleteMessage(arrayForSendForDeleteMessage).subscribe();

        //удаляем у данного юзера
        for (let i = 0; i < this.messageForDelete.length; i++) {
          this.messages.splice(this.messageForDelete[i], 1);
        }
        this.messageForDelete = [];
        this.elementPointed = [];
        this.showHiddenBlock();

        this.socket.emit("deleteMessage", arrayForSendForDeleteMessage);
      }
    })
  }

  //показываем значек обновления сообщения или нет
  showEditButtonFunction(date: any) {
    if (new Date(date).getMonth() == new Date().getMonth() && new Date(date).getDate() == new Date().getDate() &&
      new Date(date).getFullYear() == new Date().getFullYear()) {
      return true;
    } else if (new Date().getDate() - new Date(date).getDate() == 1 && new Date(date).getMonth() == new Date().getMonth() &&
      new Date(date).getFullYear() == new Date().getFullYear()) {
      if (new Date().getHours() + (24 - new Date(date).getHours()) < 25) {
        return true;
      }
    }
    return false;
  }

  //попап на всех участников
  openPopup() {
      let dialogWithUsers=this.matDialog.open(PopupChatComponent,{width:"50%",
        data:{
          title:this.title,
          users:this.usersForChat,
          imageOfChat:this.imageOfChat,
          idOfChat:this.router.snapshot.params['id']
        }
      })
    dialogWithUsers.afterClosed().subscribe(value => {
      if(value!=null){
        this.imageOfChat=value
        this.socket.emit("newImgOfChat",this.imageOfChat);
      }
    })
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

  checkImgForUser(mem: UserSystem) {
    return mem.imgAvatar!=null;
  }

  //проверяем есть лии вообще картинка для чата
  checkImgForChat(){
    return this.imageOfChat.url!=null;
  }

  //проверяем предыдущее сообщение, ставим картинку или нет
  showImageUser(i: number) {
    if(this.showDate(i)){
      return true;
    }
    if(i!=0){
      return this.messages[i].name!=this.messages[--i].name;
    }
    return false;
  }

  //ставим пустой блок, когда нет картинки
  checkEmptyBlock(i: number) {
    return !this.showImageUser(i);
  }

  //загрузка новых фото
  selectFiles(event: any): void {
    let countImgSelected=event.target.files.length;
    this.generalSizeOfImg=this.editMessagePreviews.length+countImgSelected;

    //проверка количества загружаемых сообщений за одно сообщение
    if(this.generalSizeOfImg>10){
      this.matDialog.open(PopupMaxSizeComponent,{width:"50%"})
    }else {
      this.selectedFiles = event.target.files;
      this.separateFileForSend=Array.from(this.selectedFiles!);
      this.previews = [];
      if (this.selectedFiles) {
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
  }

  newMessage() {

    this.uploadFiles();
    this.messagesDown(100,-1);
  }
  uploadFiles(): void {
    // @ts-ignore
    let message = document.getElementById("newMessage").value;
    //Добавляет новые сообщения самого пользователя
    let newMessagInDoc = new MessageAndUser();
    newMessagInDoc.name = this.nameForSending;
    newMessagInDoc.content = message;
    newMessagInDoc.date = new Date().toString()

    //Добавляет новые сообщения самого пользователя
    let newMessage = new Message(message, 1, this.router.snapshot.params['id']);
    for (let i = 0; i < this.separateFileForSend.length; i++) {
      this.formData.append("imgFile",this.separateFileForSend[i]);
    }

    //отправляем на сервер сообщение, если есть то потом и картинки
    this.serviceChat.sendMessage(newMessage).subscribe(value => {
      if(this.selectedFiles){
        this.serviceChat.loadPhotoForMessage(value,this.formData).subscribe(images => {
          newMessagInDoc.imageModelsForMessage=images;
          for(let i=0;i<newMessagInDoc.imageModelsForMessage.length;i++){
            newMessagInDoc.imageModelsForMessage[i]=this.createFImg(newMessagInDoc.imageModelsForMessage[i]);
          }
          this.messages.push(newMessagInDoc);
        });
        //очищаем поля для картинок
        setTimeout(() => {
          this.socket.emit("newMessage", newMessagInDoc);
          this.formData.delete("imgFile");
          this.previews=[];
          this.separateFileForSend=[];
          (<HTMLInputElement>document.getElementById("newMessage")).value = "";
        }, 500)
      }
    });
  }

  //удаляем новые изображения
  deleteImage(j: number) {
    this.separateFileForSend.splice(j,1);
    this.previews.splice(j,1);
    /*if(this.previews.length==0){
      document.getElementById("previews")!.setAttribute('style',"display:none");
    }*/
  }

  //удаляем изображения, редактирую сообщение
  deleteImageEditMessagePreviews(i: number) {
    this.imgForEditMessage.push(this.editMessagePreviews[i].id!);
    this.editMessagePreviews.splice(i,1);
  }

  //отказ в редактировании сообщения
  cancelUpdateMessage() {
    this.previews=[];
    this.separateFileForSend=[];
    this.selectedFiles=[];
    document.getElementById("cancelUpdateMessage")!.setAttribute('style',"display:none");
    this.editMessagePreviews=[];
    this.imgForEditMessage=[];
    (<HTMLInputElement>document.getElementById("newMessage")).value = "";
  }
}
