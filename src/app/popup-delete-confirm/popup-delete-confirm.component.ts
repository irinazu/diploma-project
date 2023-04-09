import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-popup-delete-confirm',
  templateUrl: './popup-delete-confirm.component.html',
  styleUrls: ['./popup-delete-confirm.component.css']
})
export class PopupDeleteConfirmComponent implements OnInit {

  constructor(private ref:MatDialogRef<PopupDeleteConfirmComponent>) { }

  ngOnInit(): void {
  }

  doOptions() {

    this.ref.close("true");
  }
}
