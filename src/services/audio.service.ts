// ============================================
// ONYX - Audio Service
// ============================================

export type AmbientSoundType = 'none' | 'coffee' | 'rain' | 'focus';

interface SoundConfig {
    url: string;
    isPremium: boolean;
}

const SOUNDS: Record<Exclude<AmbientSoundType, 'none'>, SoundConfig> = {
    coffee: {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder: Need actual ambient loops
        isPremium: false,
    },
    rain: {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder
        isPremium: true,
    },
    focus: {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder
        isPremium: true,
    },
};

class AudioService {
    private sound: any = null;
    private currentType: AmbientSoundType = 'none';

    private getAudioModule() {
        try {
            return require('expo-av').Audio;
        } catch {
            return null;
        }
    }

    async playAmbient(type: AmbientSoundType) {
        if (type === 'none') {
            await this.stop();
            return;
        }

        if (this.currentType === type && this.sound) {
            return; // Already playing
        }

        await this.stop();

        const Audio = this.getAudioModule();
        if (!Audio) {
            console.warn('[AudioService] Native module not available.');
            return;
        }

        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: SOUNDS[type].url },
                { shouldPlay: true, isLooping: true, volume: 0.5 }
            );
            this.sound = sound;
            this.currentType = type;
        } catch (error) {
            console.error('[AudioService] Error playing sound:', error);
        }
    }

    async stop() {
        if (this.sound) {
            try {
                await this.sound.stopAsync();
                await this.sound.unloadAsync();
            } catch (e) {
                console.warn('[AudioService] Error stopping sound:', e);
            }
            this.sound = null;
            this.currentType = 'none';
        }
    }

    async setVolume(volume: number) {
        if (this.sound) {
            try {
                await this.sound.setVolumeAsync(volume);
            } catch (e) { }
        }
    }

    getCurrentType() {
        return this.currentType;
    }
}

export const ambientAudioService = new AudioService();
