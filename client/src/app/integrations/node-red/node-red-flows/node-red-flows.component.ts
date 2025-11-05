import { Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { ProjectService, SaveMode } from '../../../_services/project.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SetupComponent } from '../../../editor/setup/setup.component';

@Component({
    selector: 'app-node-red-flows',
    templateUrl: './node-red-flows.component.html',
    styleUrls: ['./node-red-flows.component.scss']
})
export class NodeRedFlowsComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();
    urlSafe: SafeResourceUrl;
    private _link: string;
    @Input() set link(value: string) {
        this._link = value;
        this.loadLink(value);
    }

    constructor(
        private activeroute: ActivatedRoute,
        public sanitizer: DomSanitizer,
        private projectService: ProjectService,
        @Optional() private dialogRef: MatDialogRef<NodeRedFlowsComponent>,
        private dialog: MatDialog,
        private router: Router
    ) { }

    ngOnInit() {
        if (this._link) {
            // input
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this._link);
        } else {
            this.activeroute.params.pipe(
                takeUntil(this.destroy$)
            ).subscribe(params => {
                // routing
                this._link = params['url'] || '/nodered/';
                this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this._link);
            });
        }
    }

    onClose() {
        if (this.dialogRef) {
            this.dialogRef.close();
        } else {
            // If opened as a route, navigate to editor
            this.router.navigate(['/editor']);
        }
    }

    onSettings() {
        // Open settings dialog
        this.dialog.open(SetupComponent, {
            position: { top: '60px' },
        });
    }

    ngOnDestroy() {
        this.projectService.saveProject(SaveMode.Current);
        this.destroy$.next(null);
        this.destroy$.complete();
    }

    loadLink(link: string) {
        this._link = link;
        if (this._link) {
            // Convert relative URLs to absolute URLs
            let absoluteUrl = this._link;
            if (this._link.startsWith('/')) {
                // Relative URL starting with / - add current origin
                absoluteUrl = window.location.origin + this._link;
            } else if (!this._link.startsWith('http://') && !this._link.startsWith('https://')) {
                // Relative URL without leading / - add current origin and /
                absoluteUrl = window.location.origin + '/' + this._link;
            }
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(absoluteUrl);
        }
    }
}
