import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CertainChatComponent} from "./certain-chat/certain-chat.component";
import {AllChatComponent} from "./all-chat/all-chat.component";

const routes: Routes = [
  {path: '',component:AllChatComponent},
  {path: 'certainChat/:id/:title',component:CertainChatComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
