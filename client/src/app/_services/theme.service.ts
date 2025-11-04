import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { THEMES } from '../_config/theme.config';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    constructor(@Inject(DOCUMENT) private document: Document, private overlayContainer: OverlayContainer) { }

    static ThemeType = { Dark: 'dark', Default: 'default' };

    setTheme(name = ThemeService.ThemeType.Dark) {
        if (!THEMES[name]) {
            name = ThemeService.ThemeType.Dark;
        }
        // name = ThemeService.ThemeType.Dark;
        const theme = THEMES[name];
        Object.keys(theme).forEach((key) => {
            this.document.documentElement.style.setProperty(`--${key}`, theme[key]);
        });

        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('dark-theme');
        try {
            const overlayEl = this.overlayContainer.getContainerElement();
            if (overlayEl && overlayEl.classList) {
                overlayEl.classList.remove('dark-theme');
            }
        } catch (e) {
            // overlay container might not be available during server-side rendering or early init
        }
        if (name === ThemeService.ThemeType.Dark) {
            body.classList.add('dark-theme');
            try {
                const overlayEl = this.overlayContainer.getContainerElement();
                if (overlayEl && overlayEl.classList) {
                    overlayEl.classList.add('dark-theme');
                }
            } catch (e) {
                // ignore if overlay not ready
            }
        }
    }
}
