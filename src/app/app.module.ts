import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import { AllChatComponent } from './all-chat/all-chat.component';
import {HttpClientModule} from "@angular/common/http";
import { CertainChatComponent } from './certain-chat/certain-chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialogModule} from "@angular/material/dialog";
import { PopupChatComponent } from './popup-chat/popup-chat.component';
import { PopupDeleteConfirmComponent } from './popup-delete-confirm/popup-delete-confirm.component';
import { PopupMaxSizeComponent } from './popup-max-size/popup-max-size.component';

@NgModule({
  declarations: [
    AppComponent,
    AllChatComponent,
    CertainChatComponent,
    PopupChatComponent,
    PopupDeleteConfirmComponent,
    PopupMaxSizeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
