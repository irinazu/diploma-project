import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Chat} from "../models/chat";
import {Observable} from "rxjs";
import * as http from "http";
import {Message} from "../models/message";
import {MessageAndUser} from "../models/message-and-user";
import {UserSystem} from "../models/user-system";
import {ImageModel} from "../models/image-model";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  url:string="http://localhost:3000/chat"
  urlJavaServer:string="http://localhost:8080/userInfo"
  urlJavaServerChat:string="http://localhost:8080/chat"

  constructor(private http:HttpClient) { }

  getAllChatForUser(id:number):Observable<Chat[]>{
    return this.http.get<Chat[]>(`${this.urlJavaServerChat}/getAllChatForUser/${id}`)
  }
  getAllMessageForChat(id:number):Observable<MessageAndUser[]>{
    return this.http.get<MessageAndUser[]>(`${this.urlJavaServerChat}/getAllMessageForChat/${id}`)
  }
  getLastMessageForChat(id:number):Observable<Message[]>{
    return this.http.get<Message[]>(`${this.url}/getLastMessageForChat/${id}`)
  }

  updateMessage(id:number, messageForSend: {content: any,listImgInNumber:number[]}):Observable<any> {
    return this.http.post<Observable<any>>(`${this.urlJavaServerChat}/updateMessage/${id}`,messageForSend)
  }
  deleteMessage(messagesId:number[]):Observable<any> {
    return this.http.post(`${this.urlJavaServerChat}/deleteMessage`,messagesId);
  }
  getAllUserForChat(id:number):Observable<UserSystem[]> {
    return this.http.get<UserSystem[]>(`${this.urlJavaServer}/getUsersForChat/${id}`);
  }
  //взять конкретное изображение для чата
  getChatImg(id:number):Observable<ImageModel>{
    return this.http.get<ImageModel>(`${this.urlJavaServerChat}/getChatImg/${id}`);
  }
  //загрузить изображение для конкретного чата на сервер
  loadChatImgOnServer(id:number,formData:FormData):Observable<ImageModel>{
    return this.http.post<ImageModel>(`${this.urlJavaServerChat}/loadImgOfChatOnServer/${id}`,formData);
  }
  //загрузить сообщение
  sendMessage(messageForSend: Message):Observable<number> {
    return this.http.post<number>(`${this.urlJavaServerChat}/sendNewMessage`,messageForSend)
  }
  //загрузить изображение для конкретного сообщения на сервер
  loadPhotoForMessage(id:number,formData:FormData):Observable<ImageModel[]>{
    return this.http.post<ImageModel[]>(`${this.urlJavaServerChat}/loadPhotoForMessage/${id}`,formData);
  }
  //отслеживание непрочитанных сообщений
  userCloseChat(chatId:number):Observable<any>{
    return this.http.post(`${this.urlJavaServerChat}/userCloseChat/${chatId}`,chatId);
  }
  getDateForUserInChat(chatId:number):Observable<string>{
    return this.http.get<string>(`${this.urlJavaServerChat}/getDateForUserInChat/${chatId}`);
  }

  get(url: string): Observable<any>{
    return this.http.get(url);
  }
}
