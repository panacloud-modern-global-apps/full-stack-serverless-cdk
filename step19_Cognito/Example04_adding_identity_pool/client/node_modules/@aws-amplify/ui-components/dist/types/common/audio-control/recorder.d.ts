interface SilenceDetectionConfig {
    time: number;
    amplitude: number;
}
declare type SilenceHandler = () => void;
declare type Visualizer = (dataArray: Uint8Array, bufferLength: number) => void;
export declare class AudioRecorder {
    private options;
    private audioContext;
    private audioSupported;
    private analyserNode;
    private playbackSource;
    private onSilence;
    private visualizer;
    private streamBuffer;
    private streamBufferLength;
    private start;
    private recording;
    constructor(options: SilenceDetectionConfig);
    /**
     * This must be called first to enable audio context and request microphone access.
     * Once access granted, it connects all the necessary audio nodes to the context so that it can begin recording or playing.
     */
    init(): Promise<never>;
    /**
     * Setup audio nodes after successful `init`.
     */
    private setupAudioNodes;
    /**
     * Start recording audio and listen for silence.
     *
     * @param onSilence {SilenceHandler} - called whenever silence is detected
     * @param visualizer {Visualizer} - called with audio data on each audio process to be used for visualization.
     */
    startRecording(onSilence?: SilenceHandler, visualizer?: Visualizer): Promise<void>;
    /**
     * Pause recording
     */
    stopRecording(): void;
    /**
     * Pause recording and clear audio buffer
     */
    clear(): void;
    /**
     * Plays given audioStream with audioContext
     *
     * @param buffer {Uint8Array} - audioStream to be played
     */
    play(buffer: Uint8Array): Promise<unknown>;
    /**
     * Stops playing audio if there's a playback source connected.
     */
    stop(): void;
    /**
     * Called after each audioProcess. Check for silence and give fft time domain data to visualizer.
     */
    private analyse;
    /**
     * Encodes recorded buffer to a wav file and exports it to a blob.
     *
     * @param exportSampleRate {number} - desired sample rate of the exported buffer
     */
    exportWAV(exportSampleRate?: number): Promise<Blob>;
}
export {};
