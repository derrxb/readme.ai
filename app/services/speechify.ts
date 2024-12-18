import axios from "axios";
import Failure from "~/presentation/failure";

enum SupportedLanguage {
  English = "en",
}

export class Speechify {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  async getTextAudio(input: string, language: SupportedLanguage) {
    const endpoint = "/v1/audio/speech";
    const options = {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "content-type": "application/json",
        Authorization: `Bearer ${this.key}`,
      },
      body: JSON.stringify({
        input,
        language,
        model: "simba-base",
        voice_id: "henry",
        audio_format: "mp3",
        options: { loudness_normalization: true },
      }),
    };

    try {
      const result = await axios.post(`${this.url}/${endpoint}`, options);
      const decodedAudioData = Buffer.from(result.data?.audio_data, "base64");

      return decodedAudioData;
    } catch (error) {
      console.error("Failed to get audio for the provided text");
      throw new Failure(
        "bad_request",
        "Failed to get audio for the provided the provided text"
      );
    }
  }
}
