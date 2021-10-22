import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { ApiService } from '../api.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AudioService } from '../audio.service';
import { StreamState } from './../stream-state';
import { SocialShareComponent } from './../social-share/social-share.component'
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-embed',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.scss'],
})
export class EmbedComponent implements OnInit {
  episodeId:any;
  episodeData: any;
  state: StreamState = {    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: 0,
    currentTime: 0,
    canplay: false,
    error: false,
  };
  showMore: Boolean = false;
  shareOpen:Boolean = false;
  artworkSafe!: SafeStyle;
  feedArtworkSafe!: SafeStyle;
  artworkSafeLoaded!: SafeStyle;
  overlayEnabled = false;
  initialLoading = true;

  artworkUrl: string='';
  feedArtworkUrl: string='';
  title: string = '';
  subtitle: string = '';
  logoSrc: string = '';
  audioUrl: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private audioService: AudioService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
  ) { 
    this.audioService.getState()
    .subscribe(state => {
      this.state = state;
      console.log(this.state);
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.episodeId = paramMap.get("episode_id");
      this.apiService.get('https://api.aureal.one/public/getEpisode?episode_id=' + this.episodeId)
        .subscribe((res: any) => {
          console.log(res);
          // this.progress = false;
          this.episodeData = res.episode;
          this.title = this.episodeData.podcast_name;
          this.subtitle = this.episodeData.name;
          this.artworkUrl = this.episodeData.image;
          this.artworkSafe = this.sanitizer.bypassSecurityTrustStyle(`url('${this.artworkUrl}')`);
          this.feedArtworkUrl = this.episodeData.podcast_image;
          if (this.feedArtworkUrl) {
            this.feedArtworkSafe = this.sanitizer.bypassSecurityTrustStyle(`url('${this.feedArtworkUrl}')`);
          } else {
            this.feedArtworkSafe = this.sanitizer.bypassSecurityTrustStyle(`none`);
          }
          this.initialLoading = false;
          this.audioService.playStream(this.episodeData.url)
          .subscribe((events:any) => {
            console.log(events);
            if(events?.type == 'canplay'){
              this.state.canplay = true;
            }
            // listening for fun here
          });
        });
    });
  }

  artworkLoaded() {
    this.artworkSafeLoaded = this.artworkSafe;
  }

  togglePlayPause() {
    if(this.state.canplay){
      if (this.state.playing) {
        this.audioService.pause();
      } else {
        this.audioService.play();
      }
    }
  }

  showInfoToggle(){
    this.showMore = !this.showMore;
  }

  handleHotkey(event: KeyboardEvent): void {
    const key = event.code || event.key;
    switch (key) {
      // case 'KeyQ':
      //   this.isUnrestricted = !this.isUnrestricted;
      //   break;
      // case 'KeyS':
      //   this.player.playbackRate = (3 - this.player.playbackRate);
      //   break;
      // case 'KeyM':
      //   this.toggleMute();
        // break;
      case 'Space':
        event.preventDefault();
        this.togglePlayPause();
        break;
      case 'KeyK':
        this.togglePlayPause();
        break;
      case 'KeyJ':
        this.audioService.seekTo(-10);
        // this.seekBy(-10);
        break;
      case 'KeyL':
        this.audioService.seekTo(10);
        // this.seekBy(10);
        break;
      case 'ArrowLeft':
        this.audioService.seekTo(-10);
        break;
      case 'ArrowRight':
        this.audioService.seekTo(10);
        break;
      // case 'Comma':
      //   if (this.player.paused) { this.seekBy(-1 / 30); }
      //   break;
      // case 'Period':
      //   if (this.player.paused) { this.seekBy(1 / 30); }
      //   break;
      case 'Home':
        this.audioService.seekTo(0);
        break;
      case 'End':
        this.seekToRelative(1);
        break;
      case 'Digit1':
        this.seekToRelative(0.1);
        break;
      case 'Digit2':
        this.seekToRelative(0.2);
        break;
      case 'Digit3':
        this.seekToRelative(0.3);
        break;
      case 'Digit4':
        this.seekToRelative(0.4);
        break;
      case 'Digit5':
        this.seekToRelative(0.5);
        break;
      case 'Digit6':
        this.seekToRelative(0.6);
        break;
      case 'Digit7':
        this.seekToRelative(0.7);
        break;
      case 'Digit8':
        this.seekToRelative(0.8);
        break;
      case 'Digit9':
        this.seekToRelative(0.9);
        break;
      case 'Digit0':
        this.audioService.seekTo(0);
        break;
      default:
        break;
    }
  }

  seekBy(seconds: number) {
    this.audioService.seekTo(this.state.currentTime+seconds);
  }

  private seekToRelative(ratio: number) {
    this.audioService.seekTo((this.state.duration || 0) * ratio);
  }

  onSliderChangeEnd(change:any) {
    this.audioService.seekTo(change.value);
  }

  shareToggle(){
    this.shareOpen = !this.shareOpen;
  }

  share(){
      this.dialog.open(SocialShareComponent, {
        width: '80vw',
        height:  '200px',
        maxWidth: '95vw',
        hasBackdrop: true,
        data: { type: 'episode', attributes: this.episodeData }
      });
  }
}
