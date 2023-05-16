import { Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { environment } from 'src/environments/environment';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Stream } from 'agora-rtc-sdk';

@Component({
  selector: 'app-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
  })
export class SpaceComponent {
  @ViewChild('myDiv', { static: true })
  myDiv!: ElementRef;

  @ViewChild('hours', { static: true })
  hours!: ElementRef;
  @ViewChild('minutes', { static: true })
  minutes!: ElementRef;
  @ViewChild('seconds', { static: true })
  seconds!: ElementRef;

  @ViewChild('videos_container', { static: true })
  videosContainer!: ElementRef;

  totalTime: number = 15;

  rtc: {
    client: null | IAgoraRTCClient,
    localVideoTrack: ICameraVideoTrack | null,
    localAudioTrack: IMicrophoneAudioTrack | null
  } = {
      localAudioTrack: null,
      localVideoTrack: null,
      client: null,
    };

  options = {
    // Pass your App ID here.
    appId: environment.agoraAPPID,
    // Set the channel name.
    channel: 'test',
    // Pass your temp token here.
    token: null,

    // token: null,
    // Set the user ID.
    uid: Math.floor(1000 + Math.random() * 9000),
  };

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.rtc.client = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'h264',
      websocketRetryConfig: {
        timeout: 10,
        timeoutFactor: 0,
        maxRetryCount: 1,
        maxRetryTimeout: 2000,
      },
    });
    console.log('[sk] rtc', this.rtc);

    this.rtc.client.on('user-published', async (user, mediaType) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event
      await this.rtc.client!.subscribe(user, mediaType);
      console.log('[sk] subscribe success');

      console.log(mediaType, user, "==========================================>")
      // If the remote user publishes a video track.
      if (mediaType === 'video') {
        // Get the RemoteVideoTrack object in the AgoraRTCRemoteUser object.
        const remoteVideoTrack = user.videoTrack;
        // Dynamically create a container in the form of a DIV element for playing the remote video track.
        const remotePlayerContainer = document.createElement('div');
        // Specify the ID of the DIV container. You can use the uid of the remote user.
        remotePlayerContainer.id = user.uid.toString();
        remotePlayerContainer.textContent =
          'Remote user ' + user.uid.toString();
        remotePlayerContainer.style.width = '640px';
        remotePlayerContainer.style.height = '480px';
        document.body.append(remotePlayerContainer);

        const p = document.getElementById(user.uid.toString());
        // Play the remote video track.
        // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
        remoteVideoTrack?.play(this.addRemoteVideoBlock(user.uid.toString()));

        // Or just pass the ID of the DIV container.
        // remoteVideoTrack.play(playerContainer.id);
      }

      // If the remote user publishes an audio track.
      if (mediaType === 'audio') {
        // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
        const remoteAudioTrack = user.audioTrack;
        // Play the remote audio track. No need to pass any DOM element.
        remoteAudioTrack?.play();
      }

      // Listen for the "user-unpublished" event
      this.rtc.client?.on('user-unpublished', (user) => {
        // Get the dynamically created DIV container.
        const remotePlayerContainer = document.getElementById(`${user.uid.toString()}-container`);
        // Destroy the container.
        remotePlayerContainer?.remove();
      });
    });
  }

  ngAfterViewInit(): void {
    document.getElementById('join')!.onclick = () => {
      this.join();
    };

    document.getElementById('leave')!.onclick = async () => {
      // Destroy the local audio and video tracks.
      this.rtc.localAudioTrack!.close();
      this.rtc.localVideoTrack!.close();

      this.rtc.client!.remoteUsers.forEach((user) => {
        // Destroy the dynamically created DIV container.
        const playerContainer = document.getElementById(`${user.uid.toString()}-container`);
        playerContainer && playerContainer.remove();
      });

      // Leave the channel.
      await this.rtc.client!.leave();
    };

    const intervalId = setInterval(() => {
      this.totalTime -= 1;
      this.hours.nativeElement.innerText = this.appendLeadingZero(Math.floor(this.totalTime / 3600));
      this.minutes.nativeElement.innerText = this.appendLeadingZero(Math.floor((this.totalTime % 60) / 60));
      this.seconds.nativeElement.innerText = this.appendLeadingZero(Math.floor((this.totalTime % 60) % 60));
      if (this.totalTime <= 0) {
        this.playSound();
        clearInterval(intervalId);
        return;
      }
    }, 1000);
  }

  private playSound() {
    const yayAudio = new Audio();
    yayAudio.src = "../../assets/audio/yay.mp3";
    yayAudio.load();
    yayAudio.play();
  }

  private appendLeadingZero(val: number): string {
    return Math.floor(val / 10) == 0 ? `0${val}` : val.toString();
  }

  private async join() {
    // Join an RTC channel.
    console.log('[sk] start join loh');
    await this.rtc.client!.join(
      this.options.appId,
      this.options.channel,
      this.options.token,
      this.options.uid
    );
    console.log('[sk] end join loh');

    // Create a local audio track from the audio sampled by a microphone.
    console.log('[sk] start audio ambil');
    this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    console.log('[sk] end audio ambil');
    // Create a local video track from the video captured by a camera.
    this.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    // Publish the local audio and video tracks to the RTC channel.
    await this.rtc.client!.publish([
      this.rtc.localAudioTrack!,
      this.rtc.localVideoTrack!,
    ]);
    // Dynamically create a container in the form of a DIV element for playing the local video track.
    const localPlayerContainer = document.createElement('div');
    // Specify the ID of the DIV container. You can use the uid of the local user.
    localPlayerContainer.id = this.options.uid.toString();
    localPlayerContainer.textContent = 'Local user ' + this.options.uid;
    localPlayerContainer.style.width = '640px';
    localPlayerContainer.style.height = '480px';
    // document.body.append(localPlayerContainer);

    // Play the local video track.
    // Pass the DIV container and the SDK dynamically creates a player in the container for playing the local video track.
    this.rtc.localVideoTrack!.play(this.myDiv.nativeElement);
    console.log('[sk] publish success!');
  }

  private addRemoteVideoBlock(uId: string) {
    const remotePlayerContainer = document.createElement('div');
    remotePlayerContainer.id = `${uId}-container`;
    remotePlayerContainer.style.position = "relative";
    remotePlayerContainer.style.width = "30%";
    remotePlayerContainer.classList.add("video-block");
    const remotePlayer = document.createElement('div');
    remotePlayer.style.height = "300px";
    remotePlayer.style.minWidth = "200px";
    remotePlayer.id = uId;
    const remotePlayertitle = document.createElement('div');
    remotePlayertitle.classList.add("space-video-titles");
    remotePlayertitle.style.backgroundColor = "pink";
    remotePlayertitle.style.height ="58px";
    remotePlayertitle.style.textAlign = "center";
    const remotePlayerName = document.createElement('p');
    remotePlayerName.innerHTML = "JOhn";
    remotePlayerName.style.fontSize = "large";
    const remotePlayerOccupation = document.createElement('p');
    remotePlayerOccupation.innerHTML = "Software Dev";
    remotePlayertitle.append(remotePlayerName);
    remotePlayertitle.append(remotePlayerOccupation);
    remotePlayerContainer.append(remotePlayer);
    remotePlayerContainer.append(remotePlayertitle);

    // Specify the ID of the DIV container. You can use the uid of the remote user.
    this.renderer.appendChild(this.videosContainer.nativeElement, remotePlayerContainer);

    // this.videosContainer.nativeElement.append(remotePlayerContainer);
    return remotePlayer;
  }

}
