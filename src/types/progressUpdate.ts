export type ProgressUpdate = {
  type: ProgressUpdateType
  videoID: string
  downloadPercentage: number
}

export enum ProgressUpdateType {
  DOWNLOAD_BEGUN,
  DOWNLOAD_IN_PROGRESS,
  DOWNLOAD_FINISHED,
  TRANSMUXING_BEGUN,
  TRANSMUXING_FINISHED,
  AUDIO_IS_ALREADY_AVAILABLE,
}
