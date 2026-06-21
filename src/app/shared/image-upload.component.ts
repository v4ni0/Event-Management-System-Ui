import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UploadService } from '../core/services/upload.service';

@Component({
    selector: 'app-image-upload',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ImageUploadComponent),
            multi: true,
        },
    ],
    template: `
      <div class="image-upload">
        @if (currentUrl()) {
          <img [src]="currentUrl()" alt="Uploaded image preview" class="preview" />
        } @else {
          <div class="placeholder">
            <mat-icon>image</mat-icon>
            <span>{{ label() }}</span>
          </div>
        }
 
        <div class="actions">
          <button
            mat-stroked-button
            type="button"
            (click)="trigger()"
            [disabled]="disabled() || uploading()"
          >
            @if (uploading()) {
              <mat-spinner diameter="18"></mat-spinner>
              <span>Uploading…</span>
            } @else {
              <ng-container>
                <mat-icon>upload</mat-icon>
                <span>{{ currentUrl() ? 'Replace image' : 'Upload image' }}</span>
              </ng-container>
            }
          </button>
          @if (currentUrl() && !disabled() && !uploading()) {
            <button mat-button color="warn" type="button" (click)="clear()">
              <mat-icon>delete</mat-icon>
              <span>Remove</span>
            </button>
          }
        </div>
 
        <input
          #fileInput
          type="file"
          accept="image/*"
          hidden
          (change)="onFile($event)"
        />
      </div>
    `,
    styles: [
        `
        :host { display: block; }
        .image-upload {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .preview {
          max-width: 100%;
          max-height: 240px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--mat-sys-outline-variant);
        }
        .placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 160px;
          border: 1px dashed var(--mat-sys-outline);
          border-radius: 8px;
          color: var(--mat-sys-on-surface-variant);
        }
        .placeholder mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          opacity: 0.6;
        }
        .actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .actions button { display: inline-flex; align-items: center; gap: 6px; }
      `,
    ],
})
export class ImageUploadComponent implements ControlValueAccessor {
    readonly label = input<string>('No image yet');

    private readonly uploadService = inject(UploadService);
    private readonly snackBar = inject(MatSnackBar);

    readonly currentUrl = signal<string | null>(null);
    readonly uploading = signal(false);
    readonly disabled = signal(false);

    private readonly fileInput =
        viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

    private onChange: (value: string | null) => void = () => { };
    private onTouched: () => void = () => { };

    writeValue(value: string | null): void {
        this.currentUrl.set(value && value.length > 0 ? value : null);
    }

    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    trigger(): void {
        if (this.disabled() || this.uploading()) return;
        this.fileInput().nativeElement.click();
    }

    clear(): void {
        this.currentUrl.set(null);
        this.onChange(null);
        this.onTouched();
    }

    onFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            this.snackBar.open('Please choose an image file', 'Dismiss', { duration: 3000 });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.snackBar.open('Image must be 5MB or smaller', 'Dismiss', { duration: 3000 });
            return;
        }
        this.upload(file);
    }

    private upload(file: File): void {
        this.uploading.set(true);
        this.uploadService.uploadImage(file).subscribe({
            next: (url) => {
                this.currentUrl.set(url);
                this.onChange(url);
                this.onTouched();
                this.uploading.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.uploading.set(false);
                // errorInterceptor already shows a snackbar; nothing else to do.
                console.error('Image upload failed', err);
            },
        });
    }
}