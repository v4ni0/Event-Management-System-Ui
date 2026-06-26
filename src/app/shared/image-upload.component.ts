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
    templateUrl: './image-upload.component.html',
    styleUrl: './image-upload.component.css',
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