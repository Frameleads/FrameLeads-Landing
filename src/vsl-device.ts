/**
 * Device-class choice for the existing VSL interaction.
 * On mobile/iPad the YouTube iframe receives the first native tap.
 * On desktop the FrameLeads poster remains click-to-load/autoplay.
 * Does not inspect viewport width: tablet/desktop browser widths differ.
 */
export function shouldUseNativeYouTubePlayer(userAgent: string, maxTouchPoints: number): boolean {
  return /iPhone|iPad|iPod|Android/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
}
