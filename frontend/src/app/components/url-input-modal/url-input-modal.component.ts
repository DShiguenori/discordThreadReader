import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NzInputModule } from "ng-zorro-antd/input";
import { NZ_MODAL_DATA, NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: "app-url-input-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputModule],
  templateUrl: "./url-input-modal.component.html",
})
export class UrlInputModalComponent {
  threadUrl = "";

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {}
}
