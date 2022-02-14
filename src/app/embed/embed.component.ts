import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { ApiService } from '../api.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AudioService } from '../audio.service';
import { StreamState } from './../stream-state';
import { SocialShareComponent } from './../social-share/social-share.component'
import { MatDialog } from "@angular/material/dialog";
import Vibrant from 'node-vibrant';

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
  aboutData: Boolean = false;
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

  themeColor:any;
  otherEpisodesLoading: Boolean = false;
  otherEpisodes:any;
  @ViewChild("allcontent", { static: false }) allcontent: ElementRef | undefined;
  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private audioService: AudioService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    public router: Router
  ) { 

    this.audioService.getState()
    .subscribe(state => {
      this.state = state;
      console.log(this.state);
    });
  }

  formatLabel(value: number) {
    const minutes: number = Math.floor(value / 60);
    const minutestring = minutes > 9 ? minutes : ('0'+minutes);
    const secondstring = (value - minutes * 60) > 9 ? (value - minutes * 60).toFixed() : ('0'+(value - minutes * 60).toFixed());
    return minutestring + ':' + secondstring;
  }
  showOtherEpisodes: Boolean = false;

  ngOnInit(): void {
    console.log(this.allcontent?.nativeElement?.offsetHeight);

    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.episodeId = paramMap.get("episode_id");
      this.apiService.get('https://api.aureal.one/public/getEpisode?episode_id=' + this.episodeId)
        .subscribe((res: any) => {
          console.log(res);
          this.setEpisodeData(res.episode);
        });
    });
  }

  setEpisodeData(episodeData:any){
    this.episodeId = episodeData.id;
    this.episodeData = episodeData;
    console.log(this.allcontent?.nativeElement?.offsetHeight);
    if(this.allcontent?.nativeElement?.offsetHeight > 300){
      this.showOtherEpisodes = true;
    }
    this.getOtherEpisodes();
    this.title = this.episodeData.podcast_name;
    this.subtitle = this.episodeData.name;
    this.artworkUrl = this.episodeData.image ? this.episodeData.image : this.episodeData.podcast_image;
    this.artworkSafe = this.sanitizer.bypassSecurityTrustStyle(`url('${this.artworkUrl}')`);
    this.feedArtworkUrl = this.artworkUrl;
    this.getVibrantColor(this.artworkUrl);
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
  }

  playOtherEpisode(episode:any){
    // this.router.navigateByUrl('/'+episode.id);
    this.setEpisodeData(episode);
  }

  getOtherEpisodes(){
    this.otherEpisodesLoading = true;
    this.apiService.get('https://api.aureal.one/public/getOtherEpisode?episode_id=' + this.episodeId + '&podcast_id=' + this.episodeData.podcast_id).subscribe((res:any) => {
      this.otherEpisodes = res.episodes;
      this.otherEpisodesLoading = false;
    })
  }

  formatDuration(seconds:any) {
    // return (Math.floor(moment.duration(seconds, 'seconds').asHours()) > 0 ? Math.floor(moment.duration(seconds, 'seconds').asHours()) + ':' : '') + moment.duration(seconds, 'seconds').minutes() + ':' + moment.duration(seconds, 'seconds').seconds();
    if((Math.floor(parseInt(seconds) / 60)) > 0){
      return Math.floor(parseInt(seconds) / 60 ) + ' min';
    }else{
      return Math.floor(parseInt(seconds) ) + ' sec';
    }
  }


  getVibrantColor(url: string){
    // Using builder
    Vibrant.from('https://aureal-image-proxy.herokuapp.com/'+url).getPalette((err, palette:any) => {
      if(err){
        console.log(err)
      }else{
        console.log(palette);
        this.themeColor = 'rgba(' + palette.DarkMuted['_rgb'].join(',')+ ')';
      }
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
    this.aboutData = !this.aboutData;
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
