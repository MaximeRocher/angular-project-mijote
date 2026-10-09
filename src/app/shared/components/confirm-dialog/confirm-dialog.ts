import { Component, effect, input, output, viewChild, ElementRef } from "@angular/core";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.html",
  styleUrl: "./confirm-dialog.css",
})
export class ConfirmDialog {
  readonly open = input<boolean>(false);
  readonly title = input<string>("Confirmation");
  readonly message = input<string>("");
  readonly confirmLabel = input<string>("Confirmer");
  readonly cancelLabel = input<string>("Annuler");

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog");

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.open() && !el.open) {
        el.showModal();
      } else if (!this.open() && el.open) {
        el.close();
      }
    });
  }

  onCancel(event: Event): void {
    // Native Escape key: let the parent drive the state
    event.preventDefault();
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.cancelled.emit();
    }
  }
}
